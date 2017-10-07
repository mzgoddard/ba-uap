const _ast = require('./function-ast');
const astRegistry = require('./ast-registry');
const ast = astRegistry(_ast);

const r = _ast.r;

const valueArgs = [['fn'], r('fn')];
const value = ast.context(({
  methods, func, call, r, l, read, eq
}) => (fn => (
  methods({
    // (t, state, begin, end) => fn(t, state, begin, end)
    main: func(['t', 'state', 'begin', 'end'], [
      call(l(fn), [r('t'), r('state'), r('begin'), r('end')]),
    ]),
    // (a, t, state, begin, end) => fn(t, state, begin, end)
    a: func(['a', 't', 'state', 'begin', 'end'], [
      call(l(fn), [r('t'), r('state'), r('begin'), r('end')]),
    ]),
    // (t, state, begin, end) => fn(t, state, begin, end) == fn(1, state, begin, end)
    eq: func(['t', 'state', 'begin', 'end'], [
      eq(
        call(l(fn), [r('t'), r('state'), r('begin'), r('end')]),
        call(l(fn), [l(1), r('state'), r('begin'), r('end')])
      ),
    ]),
  })
)));
value.args = valueArgs;

const lerpArgs = [['fn'], r('fn')];
const lerp = ast.context(({
  methods, func, call, l, r, write, add, mul, sub, min, gte
}) => (fn => (
  methods({
    main: func(['t', 'state', 'begin', 'end'], [
      call(l(fn), [r('t'), r('state'), r('begin'), r('end')]),
    ]),
    a: func(['a', 't', 'state', 'begin', 'end'], [
      // b = fn(t, state, begin, end)
      write('b', call(l(fn), [r('t'), r('state'), r('begin'), r('end')])),
      // e = a(t, state, begin, end)
      write('e', call(r('a'), [r('t'), r('state'), r('begin'), r('end')])),
      // (e - b) * Math.min(1, t) + b
      add(mul(sub(r('e'), r('b')), min(l(1), r('t'))), r('b')),
    ]),
    eq: func(['t', 'state', 'begin', 'end'], [gte(r('t'), l(1))]),
  })
)));
lerp.args = lerpArgs;

const constantArgs = [['c'], r('c')];
const constant = ast.context(({
  func, l
}) => c => (
  lerp(func([], [l(c)]))
));
constant.args = constantArgs;

const atArgs = [['pos'], r('pos')];
const at = ast.context(({
  func, l, r, add, mul, sub
}) => pos => (
  lerp(func(['t', 'state', 'begin', 'end'], [
    // (end - begin) * pos + begin
    add(mul(sub(r('end'), r('begin')), l(pos)), r('begin'))
  ]))
));
at.args = atArgs;

const beginArgs = [[]];
const begin = ast.context(() => () => at(0));
begin.args = beginArgs;

const endArgs = [[]];
const end = ast.context(() => () => at(1));
end.args = endArgs;

const fromToArgs = [['[a, b]'], [r('a'), r('b')]];
const fromTo = ast.context(({
  func, l, call, lo, r, methods
}) => ([a, b]) => methods({
  main: func(['t', 'state', 'begin', 'end'], [
    // a.a(b, t, state, begin, end)
    call(lo(l(a), l('a')), [l(b), r('t'), r('state'), r('begin'), r('end')]),
  ]),
  a: func(['a', 't', 'state', 'begin', 'end'], [
    // a.a(b, t, state, begin, end)
    call(lo(l(a), l('a')), [l(b), r('t'), r('state'), r('begin'), r('end')]),
  ]),
  eq: func(['t', 'state', 'begin', 'end'], [
    // b.eq(t, state, begin, end)
    call(lo(l(b), l('eq')), [r('t'), r('state'), r('begin'), r('end')]),
  ]),
}));
fromTo.args = fromToArgs;

const objectArgs = [['obj'], r('obj')];
const object = ast.context(({
  methods, func, l, lo, for_of, store, read, call, branch, literal, eq, load,
  r, write, w, and
}) => obj => (
  methods({
    main: func(['t', 'state', 'begin', 'end'], [
      // for (const [key, value] of Object.entries(obj))
      for_of(obj, ['key', 'value'], [
        // state[key] = value(t, state[key], begin[key], end[key])
        store(r('state'), r('key'),
          call(r('value'), [
            r('t'),
            lo(r('state'), r('key')),
            lo(r('begin'), r('key')),
            lo(r('end'), r('key')),
          ])
        ),
      ]),
      // call(l('console.log'), [r('state')]),
      read('state'),
    ]),
    o: methods(obj),
    a: func(['b', 't', 'state', 'begin', 'end'], [
      for_of(obj, ['key', 'value'], [
        store(r('state'), r('key'),
          call(lo(r('value'), l('a')), [
            lo(lo(r('b'), l('o')), r('key')),
            r('t'),
            lo(r('state'), r('key')),
            lo(r('begin'), r('key')),
            lo(r('end'), r('key')),
          ])
        ),
      ]),
      read('state'),
    ]),
    eq: func(['t', 'state', 'begin', 'end'], [
      write('result', literal(true)),
      for_of(obj, ['key', 'value'], [
        branch(and(r('result'), call(lo(r('value'), l('eq')), [
          r('t'),
          lo(r('state'), r('key')),
          lo(r('begin'), r('key')),
          lo(r('end'), r('key')),
        ])), [
          w('result', l(false)),
        ]),
      ]),
      read('result'),
    ]),
  })
));
object.args = objectArgs;

const easingArgs = [['fn', 'tfn'], r('fn'), r('tfn')];
const easing = ast.context(({
  methods, func, call, l, r, lo
}) => (fn, tfn) => (
  methods({
    main: func(['t', 'state', 'begin', 'end'], [
      call(l(fn), [
        call(l(tfn), [
          r('t'), r('state'), r('begin'), r('end')
        ]),
        r('state'),
        r('begin'),
        r('end')
      ]),
    ]),
    a: func(['a', 't', 'state', 'begin', 'end'], [
      call(lo(l(fn), l('a')), [
        r('a'),
        call(l(tfn), [r('t'), r('state'), r('begin'), r('end')]),
        r('state'),
        r('begin'),
        r('end')
      ]),
    ]),
    eq: func(['t', 'state', 'begin', 'end'], [
      call(lo(l(fn), l('eq')), [
        call(l(tfn), [r('t'), r('state'), r('begin'), r('end')]),
        r('state'),
        r('begin'),
        r('end')
      ]),
    ]),
  })
));
easing.args = easingArgs;

const durationArgs = [['fn', 'duration'], r('fn'), r('duration')];
const duration = ast.context(({
  methods, func, call, l, r, lo, div, gte
}) => (fn, duration) => (
  methods({
    main: func(['t', 'state', 'begin', 'end'], [
      call(l(fn), [
        div(r('t'), l(duration)),
        r('state'),
        r('begin'),
        r('end')
      ]),
    ]),
    a: func(['a', 't', 'state', 'begin', 'end'], [
      call(lo(l(fn), l('a')), [
        r('a'),
        div(r('t'), l(duration)),
        r('state'),
        r('begin'),
        r('end')
      ]),
    ]),
    eq: func(['t', 'state', 'begin', 'end'], [
      gte(div(r('t'), l(duration)), l(1)),
    ]),
  })
));
duration.args = durationArgs;

const toArgs = [['a', 'b'], r('a'), r('b')];
const to = ast.context(() => (
  (a, b) => fromTo([a, b])
));
to.args = toArgs;

module.exports = {
  value,
  lerp,
  constant,
  at,
  begin,
  end,
  fromTo,
  object,
  easing,
  duration,
  to,
};
