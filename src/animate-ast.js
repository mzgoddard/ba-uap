const create = require('./ast-registry');
const baseAst = require('./function-ast');

const base = create(baseAst)
const animate = create({}, base);

const register = (name, args, fn) => (
  animate.register(name, args, animate.context(fn))
);

const value = register('value', [['fn'], base.r('fn')], ({
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

const lerp = register('lerp', [['fn'], base.r('fn')], ({
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

const constant = register('constant', [['c'], base.r('c')], ({
  func, l
}) => c => (
  lerp(func([], [l(c)]))
));

const at = register('at', [['pos'], base.r('pos')], ({
  func, l, r, add, mul, sub
}) => pos => (
  lerp(func(['t', 'state', 'begin', 'end'], [
    // (end - begin) * pos + begin
    add(mul(sub(r('end'), r('begin')), l(pos)), r('begin'))
  ]))
));

const begin = register('begin', [[]], () => () => at(0));
const end = register('end', [[]], () => () => at(1));

const fromToArgs = animate.context(({r}) => ([['[a, b]'], [r('a'), r('b')]]));
const fromTo = register('fromTo', fromToArgs, ({
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

const object = register('object', [['obj'], base.r('obj')], ({
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

const easing = register('easing', [['fn', 'tfn'], base.r('fn'), base.r('tfn')], ({
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

const duration = register('duration', [['fn', 'duration'], base.r('fn'), base.r('duration')], ({
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
      gte(r('t'), l(1)),
    ]),
  })
));

const to = register('to', [['a', 'b'], base.r('a'), base.r('b')], () => (
  (a, b) => fromTo([a, b])
));

animate.freeze();

module.exports = animate;
