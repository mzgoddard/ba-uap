const a = require('./function-ast');

class Node {
  constructor(o) {
    Object.assign(this, o);
  }
}

class Token extends Node {
  toString() {
    return this.token;
  }
}

class Local extends Node {
  toString() {
    return this.name;
  }
}

class Declare extends Node {
  toString() {
    return `var ${this.local}`;
  }
}

class Expr extends Node {
  toString() {
    return this.expr.join('');
  }
}

class Binary extends Expr {
  constructor(op, left, right) {
    super({
      type: 'expression',
      expr: [token('('), left, op, right, token(')')],
    });
  }

  get op() {
    return this.expr[2];
  }

  get left() {
    return this.expr[1];
  }

  get right() {
    return this.expr[3];
  }
}

class Literal extends Node {
  toString() {
    return this.value;
  }
}

const token = str => new Token({type: 'token', token: str});
const local = name => new Local({type: 'local', name});
const declare = local => new Declare({type: 'declare', local});
const expr = ary => new Expr({type: 'expression', expr: ary});
const binary = (op, left, right) => new Binary(op, left, right);
const literal = value => new Literal({type: 'literal', value});

const _compile_literal = ({compile, pointer}) => {
  if (typeof pointer.value === 'string') {
    return literal(JSON.stringify(pointer.value));
  }
  else if (typeof pointer.value === 'object') {
    const entries = Object.entries(pointer.value);
    return expr(
      [token('{')]
      // .concat(entries.map(([key, value]) => {
      //   return group([
      //     token(`${key}: `),
      //
      //   ]);
      // }))
      .concat([token('}')])
    );
  }
  else {
    return literal(pointer.value);
  }
}

const _compile_write = ({write, compile, pointer, locals, scope, names, vars}) => {
  let _name;
  if (!locals[pointer.name]) {
    if (!names[pointer.name]) {
      names[pointer.name] = [];
    }
    const name = `_${pointer.name}${names[pointer.name].length}`;
    names[pointer.name].push(name);
    _name = name;
  }
  else {
    _name = scope[pointer.name];
  }
  const result = expr([declare(local(_name)), local(_name), token(' = '), compile(pointer.value)]);
  if (!locals[pointer.name]) {
    locals[pointer.name] = _name;
    scope[pointer.name] = _name;
  }
  return result;
};

const _compile_read = ({write, compile, pointer, scope, stack}) => {
  let _scope = scope;
  let stackIndex = stack.length - 1;
  while (stackIndex >= 0 && !_scope[pointer.name]) {
    _scope = stack[stackIndex][1];
    stackIndex -= 1;
  }
  if (_scope[pointer.name] && _scope[pointer.name].op === 'literal') {
    return compile(_scope[pointer.name]);
  }
  else {
    return local(_scope[pointer.name]);
  }
};

const _compile_store = ({write, compile, pointer, scope}) => {
  const _expr = [compile(pointer.ref)];

  const _member = pointer.member;
  if (_member.op === 'literal') {
    _expr.push(token('.'), literal(_member.value));
  }
  else if (_member.op === 'read' && scope[_member.name].op === 'literal') {
    _expr.push(token('.'), literal(scope[_member.name].value));
  }
  else {
    _expr.push(token('['), compile(_member), token(']'));
  }
  _expr.push(token(' = '), compile(pointer.value));
  return expr(_expr);
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
  const _expr = [compile(pointer.ref)];
  const _member = pointer.member;
  if (_member.op === 'literal' && _member.value === 'methods') {}
  else if (_member.op === 'literal') {
    _expr.push(token('.'), literal(_member.value));
  }
  else if (_member.op === 'read' && _compile_lookup(stack, scope, _member.name)[_member.name].op === 'literal') {
    _expr.push(token('.'), literal(_compile_lookup(stack, scope, _member.name)[_member.name].value));
  }
  else {
    _expr.push(token('['), literal(_member), token(']'));
  }
  return expr(_expr);
};

const _compile_ops = {
  '==': (a, b) => expr([token('('), a, token(' == '), b, token(')')]),
  '!=': (a, b) => expr([token('('), a, token(' != '), b, token(')')]),
  '<': (a, b) => expr([token('('), a, token(' < '), b, token(')')]),
  '<=': (a, b) => expr([token('('), a, token(' <= '), b, token(')')]),
  '>': (a, b) => expr([token('('), a, token(' > '), b, token(')')]),
  '>=': (a, b) => expr([token('('), a, token(' >= '), b, token(')')]),

  '&&': (a, b) => expr([token('('), a, token(' && '), b, token(')')]),
  '||': (a, b) => expr([token('('), a, token(' || '), b, token(')')]),

  '+': (a, b) => binary(token(' + '), a, b),
  '-': (a, b) => binary(token(' - '), a, b),
  '*': (a, b) => binary(token(' * '), a, b),
  '/': (a, b) => binary(token(' / '), a, b),

  'min': (a, b) => expr([token('Math.min('), a, token(', '), b, token(')')]),
  'max': (a, b) => expr([token('Math.max('), a, token(', '), b, token(')')]),
};

const _compile_unary = ({write, compile, pointer}) => (
  _compile_ops[pointer.operator](compile(pointer.right))
);

const _compile_binary = ({write, compile, pointer}) => (
  _compile_ops[pointer.operator](
    compile(pointer.left),
    compile(pointer.right)
  )
);

const _compile_for_of = ({write, compile, pointer, scope}) => {
  return expr(Object.entries(pointer.iterable).map(([key, value], index) => {
    scope[pointer.keys[0]] = a.l(key);
    scope[pointer.keys[1]] = value;
    if (index < Object.keys(pointer.iterable).length - 1) {
      return expr([compile(pointer.body), token(', ')]);
    }
    else {
      return expr([compile(pointer.body)]);
    }
  }));
};

const _compile_branch = ({write, compile, pointer}) => (
  expr([
    token('('),
    compile(pointer.test),
    token(' ? '),
    compile(pointer.body),
    token(' : '),
    pointer.else.body.length ? compile(pointer.body) : token('undefined'),
    token(')')
  ])
);

const _compile_body = ({write, compile, pointer}) => (
  expr(
    [token('(')]
    .concat(
      pointer.body
      .map((statement, index) => (
        index < pointer.body.length - 1 ?
          expr([compile(statement), token(', ')]) :
          expr([compile(statement)])
      ))
    )
    .concat([token(')')])
  )
);

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
  let result;
  if (!func) {
    result = expr([
      token('('),
      compile(pointer.func),
      token(')('),
      pointer.args.map((arg, index) => (
        index < pointer.args.length - 1 ?
          expr([compile(arg), token(', ')]) :
          expr([compile(arg)])
      )),
      token(')'),
    ]);
  }
  else if (typeof func === 'function' || typeof func === 'string') {
    result = expr([
      expr([
        token('('),
        literal(func.toString()),
        token(')'),
      ]),
      token('('),
      ...pointer.args.map((arg, index) => (
        index < pointer.args.length - 1 ?
          expr([compile(arg), token(', ')]) :
          expr([compile(arg)])
      )),
      token(')'),
    ]);
  }
  else {
    if (func.op === 'methods') {
      func = func.methods.main;
    }
    result = compile(func);
  }

  const stackItem = context.stack.pop();
  context.locals = stackItem[0];
  context.scope = stackItem[1];

  return result;
};

const _compile_func = ({write, compile, pointer, context}) => {
  const oldScope = context.scope;
  const args = context.args;
  context.locals = {};
  context.scope = {};
  const _expr = [];
  _expr.push(token('('));
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
    else {
      _expr.push(expr([compile(a.write(name, args[index]))]));
      if (pointer.body.body.length || index < pointer.args.legnth - 1) {
        _expr[_expr.length - 1].expr.push(token(', '));
      }
    }
  });
  _expr.push(compile(pointer.body));
  Object.keys(context.locals).forEach(name => {
    context.names[name].pop();
  });
  _expr.push(token(')'));
  return expr(_expr);
};

const _compile_methods = ({write, compile, pointer, func}) => (
  compile(pointer.methods.main)
);

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

const _compile = (context, next) => {
  context._pointer.push(context.pointer);
  context.pointer = next;
  const result = _compile_instr[next.op](context);
  context.pointer = context._pointer.pop();
  return result;
};

function any(node, fn) {
  if (node.type === 'expression') {
    for (let i = node.expr.length - 1; i >= 0; --i) {
      if (any(node.expr[i], fn)) {
        return true;
      }
      else if (fn(node.expr[i], i, node)) {
        return true;
      }
    }
  }
  return false;
}

function pop(node, fn) {
  let result = [];
  if (node.type === 'expression') {
    for (let i = node.expr.length - 1; i >= 0; --i) {
      result = result.concat(pop(node.expr[i], fn));
      const replace = fn(node.expr[i], i, node);
      if (replace) {
        result.push(node.expr[i]);
        if (typeof replace === 'object' && replace.type) {
          node.expr.splice(i, 1, replace);
        }
        else {
          node.expr.splice(i, 1);
        }
      }
    }
  }
  return result;
}

const rules = {
  collapseExpressions: ast => (
    pop(ast, node => (
      node.type === 'expression' &&
      node.expr.length === 1 &&
      node.expr[0]
    ))
  ),

  eliminateMul0: ast => (
    pop(ast, node => (
      node.op &&
      node.op.token === ' * ' && (
        node.left.value === 0 ||
        node.right.value === 0
      ) &&
      literal(0)
    ))
  ),

  reduceMul1: ast => (
    pop(ast, node => (
      node.op &&
      node.op.token === ' * ' && (
        node.left.value === 1 &&
        node.right ||
        node.right.value === 1 &&
        node.left
      )
    ))
  ),

  reduceAdd0: ast => (
    pop(ast, node => (
      node.type === 'expression' &&
      node.expr.find(n => n.token === ' + ') &&
      node.expr.find(n => n.value === 0) &&
      node.expr.find(n => n.value !== 0 && n.type !== 'token')
    ))
  ),

  eliminateCanceledTerms: ast => (
    pop(ast, node => (
      node.op &&
      node.op.token === ' + ' &&
      node.left.op &&
      node.left.op.token === ' - ' &&
      node.left.right.name === node.right.name &&
      node.left.left
    ))
  ),

  collapseParantheses: ast => (
    // flatten extra parantheses
    pop(ast, node => (
      node.type === 'expression' &&
      node.expr.length === 3 &&
      node.expr[0].token === '(' &&
      node.expr[2].token === ')' &&
      node.expr[1].type === 'expression' &&
      node.expr[1].expr.length >= 3 &&
      node.expr[1].expr[0].token === '(' &&
      node.expr[1].expr[node.expr[1].expr.length - 1].token === ')' &&
      expr(node.expr[1].expr.slice(1, node.expr[1].expr.length - 1))
    ))
  ),

  combineCommaWithExpr: ast => (
    // flatten expr([expr([...]), token(,)]) into expr([..., token(,)])
    pop(ast, node => (
      node.type === 'expression' &&
      node.expr.length === 2 &&
      node.expr[0].type === 'expression' &&
      node.expr[1].token === ', ' && (
        node.expr[0].expr.length === 1 &&
        node.expr[0].expr[0].type === 'expression' && (
          node.expr[0].expr[0].length === 1 &&
          node.expr[0].expr[0].expr[0].type === 'expression' && 
          expr(node.expr[0].expr[0].expr[0].expr.concat(token(', '))) ||
          expr(node.expr[0].expr[0].expr.concat(token(', ')))
        ) ||
        expr(node.expr[0].expr.concat(token(', ')))
      )
    ))
  ),

  replaceMirrorAssignments: ast => (
    // remove assignments that are directly set from another local variable
    pop(ast, (node, i, parent) => (
      node.type === 'expression' &&
      node.expr.length === 5 &&
      node.expr[2].token === ' = ' &&
      node.expr[1].type === 'local' && (
        node.expr[3].type === 'local' &&
        pop(parent, (pnode, j, pp) => (
          (pp !== parent || j > i) &&
          pnode.name === node.expr[1].name &&
          node.expr[3]
        )) ||
        node.expr[3].expr && node.expr[3].expr.length === 1 &&
        node.expr[3].expr[0].type === 'local' &&
        pop(parent, (pnode, j, pp) => (
          (pp === parent && j > i || pp !== node) &&
          pnode.name === node.expr[1].name &&
          node.expr[3].expr[0]
        ))
      ) &&
      false
    ))
  ),

  removeEqualAssignments: ast => (
    pop(ast, (node, i, parent) => (
      node.type === 'expression' &&
      node.expr.length === 5 &&
      node.expr[2].token === ' = ' &&
      node.expr[1].name === node.expr[3].name
    ))
  ),

  removeUnusedLocals: ast => (
    // remove local assignments that are never read
    pop(ast, (node, j, parent) => {
      // is this an assignment?
      const write =
        node.type === 'expression' &&
        node.expr.find(((n, i) => (
          n.type === 'local' &&
          node.expr[i + 1] && node.expr[i + 1].token === ' = '
        )));
      // if it is, is it ever read?
      if (
        write &&
        any(ast, n => (
          n.type === 'expression' &&
          n.expr.find((_n, i) => (
            _n.type === 'local' &&
            _n.name === write.name && (
              !n.expr[i + 1] ||
              n.expr[i + 1] &&
              n.expr[i + 1].token !== ' = '
            )
          ))
        ))
      ) {
        return false;
      }
      else if (write) {
        return true;
      }
      else {
        return false;
      }
    })
  ),
};

const ruleSets = {
  symantics: [
    'collapseExpressions',
    'collapseParantheses',
    'combineCommaWithExpr',
    'removeEqualAssignments'
  ],
  math: [
    'eliminateCanceledTerms',
    'eliminateMul0',
    'reduceAdd0',
    'reduceMul1',
  ],
  locals: [
    'removeUnusedLocals',
    'replaceMirrorAssignments',
  ],
};

/**
 *
 * @param options {object}
 * @param options.passes {number}
 * @param options.rules {string[]}
 * @param options.ruleSets {string[]}
 */
const compile = (node, func, options = {}) => {
  if (typeof func === 'object') {
    options = func;
    func = null;
  }

  if (node.op === 'methods') {
    let main = node.methods.main ? compile(node.methods.main, 'main', options) : {};
    for (const [key, value] of Object.entries(node.methods)) {
      if (key === 'main') {continue;}
      main[key] = compile(value, key, options);
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
  context.compile = _compile.bind(null, context);

  if (node.op === 'func') {
    node.args.forEach(arg => {
      context.args.push(a.read(arg));
      context.names[arg] = [arg];
      context.scope[arg] = arg;
    });
  }

  const ast = expr([token('return '), context.compile(node), token(';')]);

  const {passes = 3} = options;
  const {rules: _rules = Object.keys(rules)} = options;
  const ruleKeys = _rules
  .concat(...(options._ruleSets || []).map(set => ruleSets[set]))
  .filter((r, i, rules) => rules.indexOf(r, i + 1) === -1);
  for (let i = 0; i < 10; ++i) {
    for (let r = 0; r < ruleKeys.length; ++r) {
      rules[ruleKeys[r]](ast);
    }
  }

  // pop out all local declarations
  const declares = pop(ast, node => node.type === 'declare');

  // Make one large var a, b, ... declaration
  if (declares.length) {
    const oneDeclare = declares
    .filter((d, i) => (
      declares.slice(i + 1)
      .findIndex(_d => d.local.name === _d.local.name) === -1
    ))
    .reduce((carry, d) => {
      carry.expr.push(d.local, token(', '));
      return carry;
    }, expr([]));
    oneDeclare.expr.pop();
    ast.expr.splice(0, 0, expr([token('var '), oneDeclare, token(';')]));
    if (ast.expr.length > 1) {
      ast.expr.splice(1, 0, token(' '));
    }
  }

  // pop arguments that are not used in the function
  const nargs = node.args.slice();
  while (nargs.length && !any(ast, node => node.type === 'local' && node.name === nargs[nargs.length - 1])) {
    nargs.pop();
  }

  // finally, create the function
  let f;
  try {
    f = new Function(...nargs.concat(ast.toString()));
  }
  catch (e) {
    console.log(e.stack || e);
    console.log(`${func ? `${func} = ` : ''}${ast.toString()}`);
    console.log(JSON.stringify(ast));
    throw e;
  }

  // custom toString that writes out javascript for this and attached functions
  if (func === 'main') {
    const _f_toString = f.toString;
    const _toString = (...filter) => {
      return `
        Object.assign(${_f_toString.call(f)}, {
          ${Object.entries(f)
            .filter(([k]) => k !== 'toString')
            .filter(([k]) => !filter.length || filter.indexOf(k) !== -1)
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
  f.toAst = () => ast;

  return f;
};

module.exports = compile;
