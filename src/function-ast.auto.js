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

class Constant extends Node {
  toString() {
    return `var ${this.local.toString()} = ${this.value.toString()};`;
  }
}

class Expr extends Node {
  toString() {
    // console.log(this.expr);
    return this.expr.join('');
  }
}

class Line extends Expr {
  toString() {
    if (this.expr.length === 0) {
      return '';
    }
    return super.toString() + ';';
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

class Result extends Expr {}

Result.hasResult = ({expr}) => {
  // console.log('hasResult', expr && expr.toString());
  if (!expr) {return false;}
  for (let i = expr.length - 1; i >= 0; --i) {
    if (expr[i] instanceof Result) {
      // console.log('will take', expr[i].toString());
      return true;
    }
    else if (expr[i].type === 'expression') {
      const result = Result.hasResult(expr[i]);
      if (result) {
        return true;
      }
    }
  }
  return false;
};

Result.take = _expr => {
  if (!_expr.expr) {
    return expr([_expr]);
  }
  if (_expr instanceof Result) {
    return _expr;
  }
  for (let i = _expr.expr.length - 1; i >= 0; --i) {
    if (_expr.expr[i] instanceof Result) {
      // console.log(_expr.expr[i].toString());
      return expr(_expr.expr.splice(i, 1)[0].expr);
    }
    else if (_expr.expr[i].type === 'expression') {
      const result = Result.take(_expr.expr[i]);
      if (result) {
        return result;
      }
    }
  }
  return null;
};

Result.taken = _expr => {
  if (!_expr.expr) {
    return expr([]);
  }
  if (_expr instanceof Result) {
    return expr([]);
  }
  return _expr;
};

// Result.transformLast = (_expr) => {
//   const {expr} = _expr;
//   if (!Result.hasResult({expr})) {
//     if (expr.length && expr[expr.length - 1].expr) {
//       expr[expr.length - 1] = result(expr[expr.length - 1].expr);
//     }
//     else if (expr.length) {
//       expr[expr.length - 1] = result([expr[expr.length - 1]]);
//     }
//   }
//   return _expr;
// };

const token = str => new Token({type: 'token', token: str});
const local = name => new Local({type: 'local', name});
const declare = local => new Declare({type: 'declare', local});
const constant = (local, value) => new Constant({type: 'constant', local, value});
const line = item => new Line({type: 'expression', expr: [item]});
const expr = ary => new Expr({type: 'expression', expr: ary});
const binary = (op, left, right) => {
  let _leftTaken = [];
  let _left = left;
  if (Result.hasResult(left)) {
    _leftTaken = Result.taken(left);
    _left = Result.take(left);
  }
  let _rightTaken = [];
  let _right = right;
  if (Result.hasResult(right)) {
    _rightTaken = Result.taken(right);
    _right = Result.take(right);
  }
  if (_left !== left || _right !== right) {
    // console.log(_left, left, _right, right);
    return expr([
      _leftTaken,
      _rightTaken,
      result([
        new Binary(op, _left, _right),
      ])
    ]);
  }
  return new Binary(op, left, right);
};
const literal = value => new Literal({type: 'literal', value});
const block = ary => new Block({type: 'expression', expr: ary});
const result = ary => new Result({type: 'expression', expr: ary});
const resultless = _r => {
  if (_r instanceof Result) {
    return expr(_r.expr);
  }
  else {
    pop(_r, node => node instanceof Result ? expr(node.expr) : false);
    return _r;
  }
}
const resultLast = ary => Result.transformLast(expr(ary));
const lift = args => {
  if (args.map(Result.hasResult).filter(Boolean).length > 0) {
    const taken = args.map(Result.taken).filter(Boolean);
    const take = args.map(Result.take).filter(Boolean);
    return expr([
      ...taken,
      result([
        ...take,
      ]),
    ]);
  }
  else {
    return expr(args);
  }
};

const _compile_literal = ({compile, pointer}) => {
  if (pointer.value && pointer.value.op === 'read') {
    return literal(pointer.value.name);
  }
  if (pointer.value && pointer.value.op === 'func') {
    return compile(pointer.value);
  }
  // else if (pointer.value && pointer.value.op === 'func') {
  //   names._f = names._f || [];
  //   const existing = globalVars.find(v => Object.values(v)[0] === pointer.value);
  //   if (existing) {
  //     write(Object.keys(existing)[0]);
  //   }
  //   else {
  //     const name = `__f${names._f.length}`;
  //     names._f.push(name);
  //     globalVars.push({[name]: pointer.value});
  //     write(name);
  //   }
  // }
  else if (typeof pointer.value === 'string') {
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

const _new_local_name = ({names}, name) => {
  let _name;
  if (!names[name]) {
    names[name] = [];
  }
  if (names[name].length === 0) {
    _name = name;
  }
  else {
    _name = `_${name}${names[name].length}`;
  }
  names[name].push(_name);
  return _name;
};

const _set_local_name = ({locals, scope}, name, _name) => {
  if (!locals[name]) {
    locals[name] = _name;
    scope[name] = _name;
  }
};

const _set_scope_name = ({scope}, name, _name) => {
  scope[name] = _name;
};

const _get_scope_name = ({scope}, name) => {
  return scope[name];
};

const _get_local_name = ({locals, context}, name) => {
  if (!locals[name]) {
    return _new_local_name(context, name);
  }
  else {
    return _get_scope_name(context, name);
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
    _name = name;
  }
  else {
    _name = scope[pointer.name];
  }
  const value = compile(pointer.value);
  let _result;
  if (Result.hasResult(value)) {
    _result = expr([
      Result.taken(value),
      result([
        declare(local(_name)),
        local(_name),
        token(' = '),
        Result.take(value),
        // token(';'),
      ]),
    ]);
  }
  else {
    _result = expr([
      declare(local(_name)),
      local(_name),
      token(' = '),
      value,
    ]);
  }
  if (!locals[pointer.name]) {
    locals[pointer.name] = _name;
    scope[pointer.name] = _name;
  }
  return _result;
};

const _compile_read = ({write, compile, pointer, scope, stack}) => {
  let _scope = scope;
  let stackIndex = stack.length - 1;
  while (stackIndex >= 0 && !_scope[pointer.name]) {
    _scope = stack[stackIndex][1];
    stackIndex -= 1;
  }
  if (_scope[pointer.name] && _scope[pointer.name].op === 'literal') {
    // console.log('read', _scope[pointer.name]);
    return compile(_scope[pointer.name]);
  }
  else {
    return local(_scope[pointer.name]);
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
  const _ref = compile(pointer.ref);

  const _member = pointer.member;
  let _deref;
  if (_member.op === 'literal') {
    _deref = expr([token('.'), literal(_member.value)]);
  }
  else if (_member.op === 'read' && _compile_lookup(stack, scope, _member.name)[_member.name].op === 'literal') {
    const found = _compile_lookup(stack, scope, _member.name)[_member.name].value;
    _deref = expr([token('.'), literal(found)]);
  }
  else {
    _deref = expr([token('['), compile(_member), token(']')]);
  }

  // console.log(pointer);
  const _value = compile(pointer.value);
  let _refTaken = expr([]);
  let _refTake = _ref;
  let _derefTaken = expr([]);
  let _derefTake = _deref;
  let _valueTaken = expr([]);
  let _valueTake = _value;
  if (Result.hasResult(_ref)) {
    _refTaken = Result.taken(_ref);
    _refTake = Result.take(_ref);
  }
  if (Result.hasResult(_deref)) {
    _derefTaken = Result.taken(_deref);
    _derefTake = Result.take(_deref);
  }
  if (Result.hasResult(_value)) {
    _valueTaken = Result.taken(_value);
    _valueTake = Result.take(_value);
  }
  if (
    _refTake !== _ref ||
    _derefTake !== _deref ||
    _valueTake !== _value
  ) {
    return expr([
      _refTaken,
      _derefTaken,
      _valueTaken,
      result([
        _refTake,
        _derefTake,
        token(' = '),
        _valueTake,
        // token(';'),
      ]),
    ]);
  } 

  return expr([
    _ref,
    _deref,
    token(' = '),
    _value,
  ]);
};

const _compile_load = ({write, compile, pointer, stack, scope}) => {
  const _ref = compile(pointer.ref);

  const _member = pointer.member;
  let _deref;
  // console.log(_ref, _member);
  if (_member.op === 'literal' && _member.value === 'methods') {
    _deref = expr([]);
  }
  else if (_member.op === 'literal' && _member.value && _member.value.op === 'read' && _compile_lookup(stack, scope, _member.name)[_member.name]) {
    _deref = expr([token('['), literal(_compile_lookup(stack, scope, _member.name)[_member.name]), token(']')]);
  }
  else if (_member.op === 'literal' && _member.value && _member.value.op === 'read') {
    _deref = expr([token('['), compile(_member), token(']')]);
  }
  else if (_member.op === 'literal' && typeof _member.value === 'number') {
    _deref = expr([token('['), literal(_member.value), token(']')]);
  }
  else if (_member.op === 'literal') {
    _deref = expr([token('.'), literal(_member.value)]);
  }
  else if (_member.op === 'read' && _compile_lookup(stack, scope, _member.name)[_member.name].op === 'literal') {
    const found = _compile_lookup(stack, scope, _member.name)[_member.name].value;
    _deref = expr([token('.'), literal(found)]);
  }
  else {
    _deref = expr([token('['), compile(_member), token(']')]);
  }

  if (Result.hasResult(_ref)) {
    return expr([
      Result.taken(_ref),
      result([
        Result.take(_ref),
        _deref,
      ]),
    ]);
  }
  return expr([_ref, _deref]);
};

const _compile_ops = {
  '==': (a, b) => lift([token('('), a, token(' == '), b, token(')')]),
  '!=': (a, b) => lift([token('('), a, token(' != '), b, token(')')]),
  '<': (a, b) => lift([token('('), a, token(' < '), b, token(')')]),
  '<=': (a, b) => lift([token('('), a, token(' <= '), b, token(')')]),
  '>': (a, b) => lift([token('('), a, token(' > '), b, token(')')]),
  '>=': (a, b) => lift([token('('), a, token(' >= '), b, token(')')]),

  '&&': (a, b) => lift([token('('), a, token(' && '), b, token(')')]),
  '||': (a, b) => lift([token('('), a, token(' || '), b, token(')')]),

  '+': (a, b) => binary(token(' + '), a, b),
  '-': (a, b) => binary(token(' - '), a, b),
  '*': (a, b) => binary(token(' * '), a, b),
  '/': (a, b) => binary(token(' / '), a, b),

  'min': (a, b) => lift([token('Math.min('), a, token(', '), b, token(')')]),
  'max': (a, b) => lift([token('Math.max('), a, token(', '), b, token(')')]),
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

const _compile_for_of = ({compile, pointer, context, scope, locals, names}) => {
  if (pointer.iterable.op === 'read') {
    const _entries_name = _new_local_name(context, 'constant_entries');
    _set_scope_name(context.stack[0] ? {scope: context.stack[0][1]} : context, 'constant_entries', _entries_name);
    const _entries = 
      constant(_entries_name, compile(a.call(a.l('Object.entries'), [pointer.iterable])));

    const i = '_for_of_index';
    const _i = _new_local_name(context, i);
    const _i_last_locals = locals[i];
    const _i_last_scope = scope[i];
    locals[i] = _i;
    scope[i] = _i;

    const len = '_for_of_length';
    const _len = _new_local_name(context, len);
    const _len_last_locals = locals[len];
    const _len_last_scope = scope[len];
    locals[len] = _len;
    scope[len] = _len;

    const _setup = compile(a.w(i, a.l(0)));
    const _test = compile(a.lt(a.r(i), a.r(len)));
    const _setupHasResult = Result.hasResult(_setup);
    const _testHasResult = Result.hasResult(_test);
    const _result = expr([
      _entries,
      resultless(expr([
        compile(a.w(len, a.lo(a.r('constant_entries'), a.l('length')))),
        token(';'),
      ])),
      _setupHasResult ? Result.taken(_setup) : expr([]),
      _testHasResult ? Result.taken(_test) : expr([]),
      expr([token('for '), token('(')]),
        expr([_setupHasResult ? Result.take(_setup) : _setup, token('; ')]),
        expr([_testHasResult ? Result.take(_test) : _test, token('; ')]),
        expr([compile(a.r(i)), token('++')]),
      expr([token(') '), token('{')]),
      resultless(compile(a.body([
        a.w(pointer.keys[0],
          a.lo(a.lo(a.r('constant_entries'), a.r(i)), a.l(0))
        ),
        a.w(pointer.keys[1],
          a.lo(a.lo(a.r('constant_entries'), a.r(i)), a.l(1))
        ),
        ...pointer.body.body
      ]))),
      token('}'),
      result([]),
    ]);

    names[i].pop();
    locals[i] = _i_last_locals;
    scope[i] = _i_last_scope;
    names[len].pop();
    locals[len] = _len_last_locals;
    scope[len] = _len_last_scope;

    return _result;
  }
  else {
    const i = '_for_of_index';
    const _i = _new_local_name(context, i);
    const _i_last_locals = locals[i];
    const _i_last_scope = scope[i];
    locals[i] = _i;

    const len = '_for_of_length';
    const _len = _new_local_name(context, len);
    const _len_last_locals = locals[len];
    const _len_last_scope = scope[len];
    locals[len] = _len;

    scope[len] = a.l(Object.entries(pointer.iterable).length);

    const _result = expr([
      ...Object.entries(pointer.iterable)
      .map(([key, value], index) => {
        scope[i] = a.l(index);

        const _key = _new_local_name(context, pointer.keys[0]);
        const _key_last_locals = locals[pointer.keys[0]];
        const _key_last_scope = scope[pointer.keys[0]];
        const _value = _new_local_name(context, pointer.keys[1]);
        const _value_last_locals = locals[pointer.keys[0]];
        const _value_last_scope = scope[pointer.keys[0]];

        locals[pointer.keys[0]] = _key;
        scope[pointer.keys[0]] = a.l(key);
        locals[pointer.keys[1]] = _value;
        scope[pointer.keys[1]] = value;

        const _body = compile(pointer.body);
        // let _result;
        // if (_body.expr) {
        //   _result = resultless(expr(_body.expr.map(_semicolon)));
        // }
        // else {
        //   _result = resultless(_semicolon(_body));
        // }
        const _result = resultless(expr([
          compile(pointer.body),
          // token(';'),
        ]));

        names[pointer.keys[0]].pop();
        locals[pointer.keys[0]] = _key_last_locals;
        scope[pointer.keys[0]] = _key_last_scope;
        names[pointer.keys[1]].pop();
        locals[pointer.keys[1]] = _value_last_locals;
        scope[pointer.keys[1]] = _value_last_scope;

        return _result;
      }),
      result([]),
    ]);

    names[i].pop();
    locals[i] = _i_last_locals;
    scope[i] = _i_last_scope;
    names[len].pop();
    locals[len] = _len_last_locals;
    scope[len] = _len_last_scope;

    return _result;
  }
};

const _compile_not_last = ({compile, pointer, scope}) => {
  if (scope._for_of_index.op && scope._for_of_index.op === 'literal') {
    return compile(
      scope._for_of_index.value < scope._for_of_length.value - 1 ?
        pointer.not_last :
        pointer.last
    );
  }
  else {
    return compile(a.call(a.func([], [
      a.w('not_last', pointer.not_last),
      a.branch(a.gte(a.r('_for_of_index'), a.sub(a.r('_for_of_length'), a.l(1))), [
        a.w('not_last', pointer.last),
      ]),
      a.r('not_last'),
    ]), []));
  }
};

const _compile_branch = ({write, compile, pointer}) => {
  const _test = compile(pointer.test);
  let _if;
  if (Result.hasResult(_test)) {
    _if = expr([
      Result.taken(_test),
      expr([token('if '), token('(')]),
      Result.take(_test),
      expr([token(') '), token('{')]),
      resultless(compile(pointer.body)),
      expr([token('}')]),
    ]);
  }
  else {
    _if = expr([
      expr([token('if '), token('(')]),
      _test,
      expr([token(') '), token('{')]),
      resultless(compile(pointer.body)),
      expr([token('}')]),
    ]);
  }
  
  if (pointer.else.body.length) {
    return expr([
      _if,
      expr([token('else '), token('{')]),
      resultless(compile(pointer.else)),
      expr([token('}')]),
    ]);
  }
  return _if;
};

const _compile_body = ({write, compile, pointer}) => {
  const b = pointer.body
    .map(compile)
    // .map(resultless)
    .filter(Boolean)
    // .map(_semicolons);

  // console.log('body', 'length', b.length, b.toString());
  if (b.length === 0) {
    return expr([]);
  }
  else if (b.length === 1) {
    // console.log('length 1', b[0].toString(), Result.hasResult(b[0]));
    if (Result.hasResult(b[0])) {
      return line(expr(b));
    }
    else {
      return line(result(b));
    }
  }
  if (Result.hasResult(b[b.length - 1])) {
    // console.log('body', 'hasResult', b[b.length - 1].toString());
    return expr([
      ...b.slice(0, b.length - 1).map(resultless).map(line),
      line(Result.taken(b[b.length - 1])),
      line(result([Result.take(b[b.length - 1])])),
    ]);
  }
  // console.log('body', b[b.length - 1].toString(), expr(b).toString());
  return expr([
    ...b.slice(0, b.length - 1).map(resultless).map(line),
    line(result([b[b.length - 1]])),
  ]);
};

const _call_search = (ref, context) => {
  // console.log(Object.entries(ref));
  if (ref.op === 'func' || typeof ref === 'function') {
    return ref;
  }
  else if (ref.op === 'literal' && ref.value && ref.value.op === 'read') {
    return ref.value;
  }
  else if (ref.op === 'literal') {
    return ref.value;
  }
  else if (ref.op === 'binary' && ref.operator === '||') {
    const _left = _call_search(ref.left, context);
    if (_left && !_left.notFound) {
      return _left;
    }
    else {
      return _call_search(ref.right, context);
    }
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
      // return _ref.methods;
      return _ref;
    }
    // console.log(_ref, ref.ref);
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

// const _call_search = (ref, context) => {
//   if (ref.op === 'func' || typeof ref === 'function') {
//     return ref;
//   }
//   else if (ref.op === 'literal') {
//     return ref.value;
//   }
//   else if (ref.op === 'read') {
//     if (context.scope[ref.name].op === 'literal') {
//       return context.scope[ref.name].value;
//     }
//     else {
//       return context.scope[ref.name];
//     }
//   }
//   else if (ref.op === 'load') {
//     return _call_search(ref.ref, context)[_call_search(ref.member, context)];
//   }
//   else if (ref.op === 'methods') {
//     return ref.methods[context.func];
//   }
//   else {
//     return a.func([], [a.l(undefined)]);
//   }
// };

const _commas = (value, index, ary) => {
  if (index < ary.length - 1) {
    return expr([value, token(', ')]);
  }
  else {
    return expr([value]);
  }
};

const _semicolon = _expr => {
  if (
    !_expr.expr ||
    _expr.expr &&
      _expr.expr[_expr.expr.length - 1] &&
      _expr.expr[_expr.expr.length - 1].token !== ';'
  ) {
    return expr([_expr, token(';')]);
  }
  return _expr;
};

const _semicolons = (value, index, ary) => {
  if (index < ary.length - 1) {
    return expr([value, token(';')]);
  }
  else {
    return expr([value]);
  }
};

const _compile_call = ({write, compile, pointer, context}) => {
  // context.stack.push([context.locals, context.scope]);

  let func = _call_search(pointer.func, context);
  // console.log('call', func, pointer.func);
  let _result;
  if (
    !func ||
    typeof func === 'function' ||
    typeof func === 'string' ||
    func.op === 'literal' &&
      func.value.op && func.value.op !== 'func' ||
    func.op === 'literal' && !func.value.op ||
    func.op === 'read'
  ) {
    let _func;
    if (!func) {
      _func = compile(pointer.func);
    }
    else if (func.op === 'literal' && func.value.op) {
      _func = compile(func.value);
    }
    else if (func.op === 'literal') {
      _func = literal(func.value);
    }
    else if (func.op === 'read' && pointer.func.op !== 'literal') {
      _func = compile(pointer.func);
    }
    else if (func.op === 'read') {
      _func = compile(func);
    }
    else {
      _func = literal(func.toString());
    }
    const _args = pointer.args.map(compile);
    const _argsTaken = [];
    const _argsTake = [];
    _args.forEach(a => {
      if (Result.hasResult(a)) {
        _argsTaken.push(Result.taken(a));
        _argsTake.push(Result.take(a));
      }
      else {
        _argsTake.push(a);
      }
    });
    if (_argsTaken.length) {
      _result = expr([
        ..._argsTaken,
        result([
          token('('), _func, token(')('),
          ..._argsTake.map(_commas),
          token(')'),
        ]),
      ]);
    }
    else {
      _result = expr([
        token('('), _func, token(')('),
        ..._argsTake.map(_commas),
        token(')'),
      ]);
    }
  }
  else {
    // console.log(func);
    if (func.op === 'methods') {
      func = func.methods.main;
    }
    context.args = pointer.args.slice();
    _result = compile(func);
    context.args = null;
  }

  // const stackItem = context.stack.pop();
  // context.locals = stackItem[0];
  // context.scope = stackItem[1];

  return _result;
};

const _push_stack = ({locals, scope, context}) => {
  context.stack.push([locals, scope]);
  context.locals = {};
  context.scope = {};
};

const _pop_stack = ({context}) => {
  const [locals, scope] = context.stack.pop();
  context.locals = locals;
  context.scope = scope;
};

const _pop_names = ({names}, _names) => {
  _names.forEach(key => {
    names[key].pop();
  });
};

const _lift_blocks = expr => {
  
};

const _compile_func = ({write, compile, pointer, context}) => {
  const args = context.args;
  context.args = null;
  // console.log('func', args, JSON.stringify(pointer.body));

  if (!args) {
    const oldLocals = context.locals;
    const oldScope = context.scope;
    const args = context.args;

    _push_stack(context);

    const body = pointer.body;
    // let _body;
    const _head = expr([
      token('function('), ...pointer.args.map(arg => {
        const name = _get_local_name(context, arg);
        _set_scope_name(context, arg, name);
        return name;
      }).map(_commas), token(') '),
    ]);
    const _body = compile(body);

    // pop out all local declarations
    const declares = pop(_body, node => node && node.type === 'declare');

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
      _body.expr.splice(0, 0, expr([token('var '), oneDeclare, token(';')]));
      if (_body.expr.length > 1) {
        _body.expr.splice(1, 0, token(' '));
      }
    }

    // pop out all constants
    const constants = pop(_body, node => node && node.type === 'constant');

    if (constants.length) {
      _body.expr.splice(0, 0, expr(constants.map(_semicolons)));
    }

    let _result;
    if (Result.hasResult(_body)) {
      _result = result([
        _head,
        token('{'),
        expr([
          Result.taken(_body),
          // token(';'),
        ]),
        expr([
          token('return '),
          Result.take(_body),
          // token(';'),
        ]),
        token('}'),
      ].filter(Boolean));
    }
    else if (_body.expr && _body.expr.length > 0) {
      _result = expr([
        _head,
        token('{'),
        expr(_body.expr.slice(0, _body.expr.length - 1)),
        expr([
          token('return '),
          _body.expr[_body.expr.length - 1],
          // token(';'),
        ]),
        token('}'),
      ].filter(Boolean));
    }
    else {
      _result = expr([
        _head,
        token('{'), token('}'),
      ]);
    }

    _pop_names(context, Object.keys(context.locals));
    _pop_names(context, pointer.args);
    _pop_stack(context);

    return _result;
  }

  const oldScope = context.scope;
  _push_stack(context);

  // console.log('func', args, JSON.stringify(pointer.body));
  // console.log(pointer.args.length, pointer.args);

  // _expr.push(token('('));
  const _args = [];
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
      _args.push(a.write(name, args[index]));
    }
  });

  const _expr = compile(a.body(_args.concat(pointer.body.body)));
  // _expr.push(token(')'));

  _pop_names(context, Object.keys(context.locals));
  _pop_stack(context);

  return _expr;
};

const _compile_methods = ({write, compile, pointer, func}) => (
  pointer.methods.op ?
    compile(pointer.methods) :
  pointer.methods.main ?
    compile(a.call(a.l(a.func([], [
      a.w('f', pointer.methods.main),
      ...(Object.keys(pointer.methods).filter(m => m !== 'main')).map(m => (
        a.st(a.r('f'), a.l(m), pointer.methods[m])
      )),
      a.r('f'),
    ])), [])) :
    compile(a.call(a.l(a.func([], [
      a.w('f', a.l({})),
      ...Object.keys(pointer.methods).map(m => (
        a.st(a.r('f'), a.l(m), pointer.methods[m])
      )),
      a.r('f'),
    ])), []))
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
  not_last: _compile_not_last,
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
  if (node && node.type === 'expression') {
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
const compile = (node, options = {}) => {
  // given a function generator. call it with the stated arguments and compile
  // of a function that will generate a function that works the same as a fully
  // declared and inline-able function.
  if (typeof node === 'function') {
    node = a.func(node.args[0], [
      node(...node.args.slice(1)),
    ]);
  }
  else {
    node = a.func([], [node]);
  }

  const context = {
    // func,
    _body: '',
    _pointer: [],
    pointer: null,
    stack: [],
    args: null,
    scope: {},
    locals: {},
    names: {},
    vars: [],
  };
  context.context = context;
  context.compile = _compile.bind(null, context);

  const ast = context.compile(node);
  return ast;

  // const {passes = 3} = options;
  // const {rules: _rules = Object.keys(rules)} = options;
  // const ruleKeys = _rules
  // .concat(...(options._ruleSets || []).map(set => ruleSets[set]))
  // .filter((r, i, rules) => rules.indexOf(r, i + 1) === -1);
  // for (let i = 0; i < 10; ++i) {
  //   for (let r = 0; r < ruleKeys.length; ++r) {
  //     rules[ruleKeys[r]](ast);
  //   }
  // }

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

// const compile = gen => {
//   const args = gen.args ?
//     gen.args.slice(1) :
//     Array.from(new Array(gen.length), (_, i) => a.r(String.fromCharCode(97 + i)));
//   const node = gen(...args);
//
//   let body = '';
//   const names = {};
//   args.forEach(a => {
//     names[a.name] = [a.name];
//   });
//   const globalVars = [];
//   for (const key of Object.keys(node.methods)) {
//     const context = {
//       func,
//       _body: '',
//       _pointer: [],
//       pointer: null,
//       stack: [],
//       args: [],
//       scope: {},
//       locals: {},
//       names: names,
//       globalVars: globalVars,
//       vars: [],
//     };
//     context.context = context;
//     context.write = __compile_write.bind(null, context);
//     context.compile = _compile.bind(null, context);
//
//     args.forEach(a => {
//       context.args.push(a);
//       context.scope[a.name] = a.name;
//     });
//
//     if (key === 'main') {
//       context.write('const f = ');
//     }
//     else {
//       context.write(`f.${key} = `);
//     }
//
//     context.compile(node.methods[key]);
//
//     body += `${context._body};\n`;
//   }
//
//   const vars = globalVars.reduce((carry, v) => {
//     Object.entries(v).forEach(([key, value]) => {
//       if (carry.findIndex(_v => _v[0] === key) === -1) {
//         carry.push([key, value]);
//       }
//     });
//     return carry;
//   }, []);
//
//   let _varsBody = '';
//   vars.forEach(([key, value]) => {
//     _varsBody += `var ${key} = `;
//
//     const context = {
//       func,
//       _body: '',
//       _pointer: [],
//       pointer: null,
//       stack: [],
//       args: [],
//       scope: {},
//       locals: {},
//       names: names,
//       globalVars: globalVars,
//       vars: [],
//     };
//     context.context = context;
//     context.write = __compile_write.bind(null, context);
//     context.compile = _compile.bind(null, context);
//
//     args.forEach(a => {
//       context.args.push(a);
//       context.scope[a.name] = a.name;
//     });
//
//     context.compile(value);
//     _varsBody += `${context._body};\n`;
//   });
//   body = _varsBody + body;
//   body += `return f;`;
//   const fargs = gen.args ?
//     gen.args[0] :
//     args.map(l => l.name);
//   return new Function(...fargs.concat(body));
// };
//
// module.exports = compile;
