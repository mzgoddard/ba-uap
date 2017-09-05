const a = require('./function-ast');
const {read, func} = a;

const _compile_literal = ({write, pointer, globalVars, names}) => {
  if (pointer.value && pointer.value.op === 'read') {
    write(pointer.value.name);
  }
  else if (pointer.value && pointer.value.op === 'func') {
    names._f = names._f || [];
    const existing = globalVars.find(v => Object.values(v)[0] === pointer.value);
    if (existing) {
      write(Object.keys(existing)[0]);
    }
    else {
      const name = `__f${names._f.length}`;
      names._f.push(name);
      globalVars.push({[name]: pointer.value});
      write(name);
    }
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
  else if (typeof pointer.value === 'string') {
    write(JSON.stringify(pointer.value));
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

const _compile_lookup = (stack, scope, name) => {
  let _scope = scope;
  let stackIndex = stack.length - 1;
  while (stackIndex >= 0 && !_scope[name]) {
    _scope = stack[stackIndex][1];
    stackIndex -= 1;
  }
  return _scope;
};

const _compile_store = ({write, compile, pointer, stack, scope}) => {
  compile(pointer.ref);
  const _member = pointer.member;
  if (_member.op === 'literal') {
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
  write(` = `);
  compile(pointer.value);
};

const _compile_load = ({write, compile, pointer, stack, scope}) => {
  compile(pointer.ref);
  const _member = pointer.member;
  if (_member.op === 'literal' && _member.value === 'methods') {}
  else if (_member.op === 'literal' && _member.value && _member.value.op === 'read') {
    write(`[${_member.value.name}]`);
  }
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

const _compile_for_of = ({write, compile, pointer, scope, globalVars: vars}) => {
  vars.push({entries: a.call(a.l('Object.entries'), [pointer.iterable])});
  write(`for (const [${pointer.keys[0]}, ${pointer.keys[1]}] of entries) `);
  scope[pointer.keys[0]] = pointer.keys[0];
  scope[pointer.keys[1]] = pointer.keys[1];
  write(`{`);
  compile(pointer.body);
  write(`}`);
};

const _compile_branch = ({write, compile, pointer}) => {
  write('if (')
  compile(pointer.test);
  write(') ');
  write(`{`);
  compile(pointer.body);
  write(`}`);
  if (pointer.else.body.length) {
    write('else {');
    compile(pointer.else);
    write('}');
  }
};

const _compile_body = ({write, compile, pointer}) => {
  for (const statement of pointer.body) {
    compile(statement);
    write(`;\n`);
  }
};

const _call_search = (ref, context) => {
  if (ref.op === 'func' || typeof ref === 'function') {
    return ref;
  }
  else if (ref.op === 'literal') {
    return ref.value;
  }
  else if (ref.op === 'read') {
    if (context.scope[ref.name].op === 'literal') {
      return context.scope[ref.name].value;
    }
    else {
      return context.scope[ref.name];
    }
  }
  else if (ref.op === 'load') {
    return _call_search(ref.ref, context)[_call_search(ref.member, context)];
  }
  else if (ref.op === 'methods') {
    return ref.methods[context.func];
  }
  else {
    return a.func([], [a.l(undefined)]);
  }
};

const _compile_call = ({write, compile, pointer, context}) => {
  context.stack.push([context.locals, context.scope]);
  // context.args = pointer.args.slice();

  if (
    pointer.func.op === 'literal' &&
    pointer.func.value.op &&
    pointer.func.value.op === 'func' &&
    pointer.func.value.body.body.length === 1 &&
    pointer.func.value.body.body[0].op === 'literal'
  ) {
    compile(pointer.func.value.body.body[0]);
    const stackItem = context.stack.pop();
    context.locals = stackItem[0];
    context.scope = stackItem[1];
    return;
  }
  else if (pointer.func.op === 'literal' && pointer.func.value.op) {
    compile(pointer.func.value);
  }
  else if (pointer.func.op === 'literal') {
    write(pointer.func.value);
  }
  else {
    compile(pointer.func);
  }
  write('(');
  pointer.args.forEach((arg, index) => {
    compile(arg);
    if (index < pointer.args.length - 1) {
      write(', ');
    }
  });
  write(')');

  const stackItem = context.stack.pop();
  context.locals = stackItem[0];
  context.scope = stackItem[1];
};

const _compile_func = ({write, compile, pointer, context, names}) => {
  const oldLocals = context.locals;
  const oldScope = context.scope;
  const args = context.args;
  context.stack.push([oldLocals, oldScope]);
  context.locals = {};
  context.scope = {};
  write('function(');
  write(pointer.args.map(arg => {
    if (!names[arg]) {
      names[arg] = [];
    }
    let name;
    if (names[arg].length === 0) {
      name = arg;
    }
    else {
      name = `_${arg}${names[arg].length}`;
    }
    names[arg].push(name);
    context.scope[arg] = name;
    return name;
  }).join(', '));
  write(`) `);
  write('{')

  let _body = context._body;
  context._body = '';
  const _vars = context.vars;
  context.vars = [];
  const body = pointer.body.body;
  compile(a.body(body.slice(0, body.length - 1)));
  if (body.length) {
    write('return ');
    compile(body[body.length - 1]);
    write(';');
  }
  write('}');
  const vars = context.vars.reduce((carry, v) => {
    if (carry.indexOf(v) === -1) {
      carry.push(v);
    }
    return carry;
  }, []);
  if (vars.length) {
    _body += 'var ';
    _body += vars.join(', ');
    _body += '; ';
  }
  _body += context._body;
  context._body = _body;
  context.vars = _vars;
  context.stack.pop();
  Object.keys(context.locals).forEach(key => {
    context.names[key].pop();
  });
  pointer.args.forEach(arg => {
    context.names[arg].pop();
  });
  context.locals = oldLocals;
  context.scope = oldScope;
};

const _compile_methods = ({write, pointer, func}) => {
  write(pointer.methods.name);
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

const compile = gen => {
  const args = gen.args ?
    gen.args.slice(1) :
    Array.from(new Array(gen.length), (_, i) => a.r(String.fromCharCode(97 + i)));
  const node = gen(...args);

  let body = '';
  const names = {};
  args.forEach(a => {
    names[a.name] = [a.name];
  });
  const globalVars = [];
  for (const key of Object.keys(node.methods)) {
    const context = {
      func,
      _body: '',
      _pointer: [],
      pointer: null,
      stack: [],
      args: [],
      scope: {},
      locals: {},
      names: names,
      globalVars: globalVars,
      vars: [],
    };
    context.context = context;
    context.write = __compile_write.bind(null, context);
    context.compile = _compile.bind(null, context);

    args.forEach(a => {
      context.args.push(a);
      context.scope[a.name] = a.name;
    });

    if (key === 'main') {
      context.write('const f = ');
    }
    else {
      context.write(`f.${key} = `);
    }

    context.compile(node.methods[key]);

    body += `${context._body};\n`;
  }

  const vars = globalVars.reduce((carry, v) => {
    Object.entries(v).forEach(([key, value]) => {
      if (carry.findIndex(_v => _v[0] === key) === -1) {
        carry.push([key, value]);
      }
    });
    return carry;
  }, []);

  let _varsBody = '';
  vars.forEach(([key, value]) => {
    _varsBody += `var ${key} = `;

    const context = {
      func,
      _body: '',
      _pointer: [],
      pointer: null,
      stack: [],
      args: [],
      scope: {},
      locals: {},
      names: names,
      globalVars: globalVars,
      vars: [],
    };
    context.context = context;
    context.write = __compile_write.bind(null, context);
    context.compile = _compile.bind(null, context);

    args.forEach(a => {
      context.args.push(a);
      context.scope[a.name] = a.name;
    });

    context.compile(value);
    _varsBody += `${context._body};\n`;
  });
  body = _varsBody + body;
  body += `return f;`;
  const fargs = gen.args ?
    gen.args[0] :
    args.map(l => l.name);
  return new Function(...fargs.concat(body));
};

module.exports = compile;
