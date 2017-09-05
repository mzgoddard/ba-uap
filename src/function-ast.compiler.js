const a = require('./function-ast');
const {read, func} = a;

const _compile_literal = ({write, compile, pointer}) => {
  if (typeof pointer.value === 'string') {
    write(JSON.stringify(pointer.value));
  }
  else if (pointer.op === 'read') {
    compile(value);
  }
  else if (typeof pointer.value === 'object') {
    write('{');
    const v = Object.entries(pointer.value);
    v.forEach(([key, value], index) => {
      write(`${key}:`);
      if (!value) {
        compile(a.l(value));
      }
      else if (value && !value.op) {
        compile(a.l(value));
      }
      else {
        compile(value);
      }
      if (index < v.length - 1) {
        write(', ');
      }
    });
    write('}');
  }
  else {
    write(pointer.value);
  }
};

const _compile_write = ({write, compile, pointer, locals, scope, names, vars}) => {
  let _name;
  if (!locals[pointer.name]) {
    if (!names[pointer.name]) {
      names[pointer.name] = [];
    }
    const name = `_${pointer.name}${names[pointer.name].length}`;
    names[pointer.name].push(name);
    vars.push(name);
    _name = name;
  }
  else {
    _name = scope[pointer.name];
  }
  write(`${_name} = `);
  compile(pointer.value);
  if (!locals[pointer.name]) {
    locals[pointer.name] = _name;
    scope[pointer.name] = _name;
  }
};

const _compile_read = ({write, compile, pointer, scope, stack}) => {
  let _scope = scope;
  let stackIndex = stack.length - 1;
  while (stackIndex >= 0 && !_scope[pointer.name]) {
    _scope = stack[stackIndex][1];
    stackIndex -= 1;
  }
  if (_scope[pointer.name] && _scope[pointer.name].op === 'literal') {
    compile(_scope[pointer.name]);
  }
  else {
    write(`${_scope[pointer.name]}`);
  }
};

const _compile_store = ({write, compile, pointer, scope}) => {
  compile(pointer.ref);
  const _member = pointer.member;
  if (_member.op === 'literal') {
    write(`.${_member.value}`);
  }
  else if (_member.op === 'read' && scope[_member.name].op === 'literal') {
    write(`.${scope[_member.name].value}`);
  }
  else {
    write(`[`);
    compile(_member);
    write(`]`);
  }
  write(` = `);
  compile(pointer.value);
};

const _compile_lookup = (stack, scope, name) => {
  let _scope = scope;
  let stackIndex = stack.length - 1;
  while (stackIndex >= 0 && !_scope[name]) {
    _scope = stack[stackIndex][1];
    stackIndex -= 1;
  }
  return _scope;
};

const _compile_load = ({write, compile, pointer, stack, scope}) => {
  compile(pointer.ref);
  const _member = pointer.member;
  if (_member.op === 'literal' && _member.value === 'methods') {}
  else if (_member.op === 'literal') {
    write(`.${_member.value}`);
  }
  else if (_member.op === 'read' && _compile_lookup(stack, scope, _member.name)[_member.name].op === 'literal') {
    write(`.${_compile_lookup(stack, scope, _member.name)[_member.name].value}`);
  }
  else {
    write(`[`);
    compile(_member);
    write(`]`);
  }
};

const _compile_ops = {
  '==': (w, a, b) => (a(), w(' == '), b()),
  '!=': (w, a, b) => (a(), w(' != '), b()),
  '<': (w, a, b) => (a(), w(' < '), b()),
  '<=': (w, a, b) => (a(), w(' <= '), b()),
  '>': (w, a, b) => (a(), w(' > '), b()),
  '>=': (w, a, b) => (a(), w(' >= '), b()),

  '&&': (w, a, b) => (a(), w(' && '), b()),
  '||': (w, a, b) => (a(), w(' || '), b()),

  '+': (w, a, b) => (a(), w(' + '), b()),
  '-': (w, a, b) => (a(), w(' - '), b()),
  '*': (w, a, b) => (a(), w(' * '), b()),
  '/': (w, a, b) => (a(), w(' / '), b()),

  'min': (w, a, b) => (w('Math.min('), a(), w(', '), b(), w(')')),
  'max': (w, a, b) => (w('Math.max('), a(), w(', '), b(), w(')')),
};

const _compile_unary = ({write, compile, pointer}) => {
  write('(');
  _compile_ops[pointer.operator](
    write,
    () => compile(pointer.right)
  );
  write(')');
};

const _compile_binary = ({write, compile, pointer}) => {
  write('(');
  _compile_ops[pointer.operator](
    write,
    () => compile(pointer.left),
    () => compile(pointer.right)
  );
  write(')');
};

const _compile_for_of = ({write, compile, pointer, scope}) => {
  Object.entries(pointer.iterable).forEach(([key, value], index) => {
    scope[pointer.keys[0]] = a.l(key);
    scope[pointer.keys[1]] = value;
    compile(pointer.body);
    if (index < Object.keys(pointer.iterable).length - 1) {
      write(', ');
    }
  });
};

const _compile_branch = ({write, compile, pointer}) => {
  write('(');
  compile(pointer.test);
  write(' ? ');
  compile(pointer.body);
  write(` : `);
  if (pointer.else.body.length) {
    compile(pointer.else);
  }
  else {
    write('undefined');
  }
  write(')');
};

const _compile_body = ({write, compile, pointer}) => {
  write(`(`);
  for (const statement of pointer.body.slice(0, pointer.body.length - 1)) {
    compile(statement);
    write(`, `);
  }
  if (pointer.body.length) {
    compile(pointer.body[pointer.body.length - 1]);
  }
  write(`)`);
};

const _call_search = (ref, context) => {
  if (ref.op === 'func' || typeof ref === 'function') {
    return ref;
  }
  else if (ref.op === 'literal') {
    return ref.value;
  }
  else if (ref.op === 'read') {
    if (
      _compile_lookup(context.stack, context.scope, ref.name)[ref.name] &&
      _compile_lookup(context.stack, context.scope, ref.name)[ref.name].op === 'literal'
    ) {
      return _compile_lookup(context.stack, context.scope, ref.name)[ref.name].value;
    }
    else {
      return _compile_lookup(context.stack, context.scope, ref.name)[ref.name];
    }
  }
  else if (ref.op === 'load') {
    let _ref = _call_search(ref.ref, context);
    if (ref.member.op === 'literal' && ref.member.value === 'methods') {
      return _ref.methods;
    }
    if (_ref.op === 'methods') {
      _ref = _ref.methods;
    }
    if (ref.member.op === 'literal') {
      return _ref[ref.member.value];
    }
    else {
      return _ref[_call_search(ref.member, context)];
    }
  }
  else if (ref.op === 'methods') {
    return ref.methods[context.func];
  }
  else {
    return Object.assign(a.func([], [a.l(undefined)]), {notFound: true});
  }
};

const _compile_call = ({write, compile, pointer, context}) => {
  context.stack.push([context.locals, context.scope]);
  context.args = pointer.args.slice();

  let func = _call_search(pointer.func, context);
  if (!func) {
    write('(');
    compile(pointer.func);
    write(')(');
    pointer.args.forEach((arg, index) => {
      compile(arg);
      if (index < pointer.args.length - 1) {
        write(', ');
      }
    });
    write(')');
  }
  else if (typeof func === 'function' || typeof func === 'string') {
    write('(');
    write(func.toString());
    write(')(');
    pointer.args.forEach((arg, index) => {
      compile(arg);
      if (index < pointer.args.length - 1) {
        write(', ');
      }
    });
    write(')');
  }
  else {
    if (func.op === 'methods') {
      func = func.methods.main;
    }
    compile(func);
  }

  const stackItem = context.stack.pop();
  context.locals = stackItem[0];
  context.scope = stackItem[1];
};

const _walkForName = (name, node) => (
  node && (
    node.op === 'methods' ?
      _walkForName(name, node.methods.main && node.methods.main.body) :
    node.op === 'body' ?
      node.body.find(_n => _walkForName(name, _n)) :
    node.op === 'branch' ?
      _walkForName(name, node.body) || _walkForName(name, node.else) :
    node.body.op === 'body' ?
      _walkForName(name, node.body) :
    node.op === 'call' ?
      node.args.find((_n, i) => (
        _walkForName(name, _n) && (
          node.func && node.func.op === 'func' &&
          _walkForName(node.func.args[i], node.func.body) ||
          node.func && node.func.op === 'literal' && node.func.value && node.func.value.op === 'func' &&
          _walkForName(node.func.value.args[i], node.func.value.body) ||
          node.func && node.func.op !== 'func' && (
            node.func.op !== 'literal' ||
            node.func.value && node.func.value.op !== 'func'
          )
        )
      )) :
    node.op === 'write' ?
      (node.name === name || _walkForName(name, node.value)) && node :
    node.op === 'binary' ?
      _walkForName(name, node.left) || _walkForName(name, node.right) :
    node.op === 'unary' ?
      _walkForName(name, node.right) :
    node.ref ?
      _walkForName(name, node.ref) :
    node.member ?
      _walkForName(name, node.member) :
      node.name === name && node
  )
);

const _compile_func = ({write, compile, pointer, context}) => {
  const oldScope = context.scope;
  const args = context.args;
  context.locals = {};
  context.scope = {};
  write('(');
  pointer.args.forEach((name, index) => {
    let maybeCall;
    try {
      maybeCall = _call_search(args[index], context);
    }
    catch (e) {}
    if (maybeCall && maybeCall.op === 'methods') {
      maybeCall = maybeCall.methods.main;
    }
    if (args[index].op === 'literal') {
      context.scope[name] = args[index];
    }
    else if (args[index].op === 'read') {
      context.scope[name] = oldScope[args[index].name];
    }
    else if (maybeCall && !maybeCall.notFound) {
      context.scope[name] = maybeCall;
    }
    // else if (!_walkForName(name, pointer.body)) {
    //   context.scope[name] = name;
    // }
    else {
      compile(a.write(name, args[index]));
      if (pointer.body.body.length || index < pointer.args.legnth - 1) {
        write(', ');
      }
    }
  });
  compile(pointer.body);
  Object.keys(context.locals).forEach(name => {
    context.names[name].pop();
  });
  write(')');
};

const _compile_methods = ({write, compile, pointer, func}) => {
  compile(pointer.methods.main);
};

const _compile_instr = {
  literal: _compile_literal,
  write: _compile_write,
  read: _compile_read,
  store: _compile_store,
  load: _compile_load,
  unary: _compile_unary,
  binary: _compile_binary,
  for_of: _compile_for_of,
  branch: _compile_branch,
  body: _compile_body,
  call: _compile_call,
  func: _compile_func,
  methods: _compile_methods,
};

const __compile_write = (context, str) => {
  context._body += str;
}

const _compile = (context, next) => {
  context._pointer.push(context.pointer);
  context.pointer = next;
  _compile_instr[next.op](context);
  context.pointer = context._pointer.pop();
};

const compile = (node, func) => {
  if (node.op === 'methods') {
    let main = node.methods.main ? compile(node.methods.main, 'main') : {};
    for (const [key, value] of Object.entries(node.methods)) {
      if (key === 'main') {continue;}
      main[key] = compile(value, key);
    }
    return main;
  }

  const context = {
    func,
    _body: '',
    _pointer: [],
    pointer: null,
    stack: [],
    args: [],
    scope: {},
    locals: {},
    names: {},
    vars: [],
  };
  context.context = context;
  context.write = __compile_write.bind(null, context);
  context.compile = _compile.bind(null, context);

  if (node.op === 'func') {
    node.args.forEach(arg => {
      context.args.push(read(arg));
      context.names[arg] = [arg];
      context.scope[arg] = arg;
    });
  }

  context.compile(node);

  const vars = context.vars.reduce((carry, v) => {
    if (carry.indexOf(v) === -1) {
      carry.push(v);
    }
    return carry;
  }, []);

  let body = '';
  if (vars.length) {
    body += 'var ';
    body += vars.join(', ');
    body += '; ';
  }
  body += `return ${context._body};`;
  const f = new Function(...node.args.concat(body));
  if (func === 'main') {
    const _f_toString = f.toString;
    const _toString = () => {
      return `
        Object.assign(${_f_toString.call(f)}, {
          ${Object.entries(f)
            .filter(([k]) => k !== 'toString')
            .map(([k, v]) => `${k}: ${typeof v === 'object' ?
              `{${Object.entries(v)
                .filter(([k]) => k !== 'toString')
                .map(([k, v]) => `${k}: ${v.toString()}`)
                .join(',\n')}}` :
                v.toString()}`)
            .join(',\n')}
        })
      `;
    };
    f.toString = _toString;
  }
  return f;
};

module.exports = compile;
