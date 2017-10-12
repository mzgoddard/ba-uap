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

// const keyframesSum = _frames => {
//   if (Array.isArray(_frames)) {
//
//   }
//   else {
//     let sum = 0;
//     return frames => {
//       if (sum === 0) {
//
//       }
//       return sum;
//     };
//   }
// };

const keyframesArgs = [['frames'], r('frames')];
const keyframes = ast.context(({
  methods, func, w, r, l, for_of, lo, sub, add, branch, call, not_last, lt, gte,
  lte, min, max, gt, and, or, mul,
}) => frames => (
  methods({
    main: func(['t', 'state', 'begin', 'end'], [
      // let sum = frames.reduce((a, b) => a + b.t(), 0);
      w('sum', call(l(func(['frames'], [
        w('s', l(0)),
        for_of(frames, ['_', 'value'], [
          w('s', add(r('s'), call(lo(r('value'), l('t')), []))),
        ]),
        r('s'),
      ])), [r('frames')])),
      // let out = state;
      w('out', r('state')),
      // let _t = Math.max(Math.min(t * sum), 1), 0);
      w('t', max(min(mul(r('t'), r('sum')), l(1)), l(0))),
      // for (let [_, value] of Object.entries(frames)) {
      for_of(frames, ['_', 'value'], [
        // if (i > 0 && t < 0) {
        branch(and(gt(r('_for_of_index'), l(0)), lte(r('t'), l(0))), [
          // out = frames[i - 1].a(value, frames[i - 1].t() + t, state, begin, end);
          w('out', call(lo(lo(l(frames), sub(r('_for_of_index'), l(1))), l('a')), [
            l(r('value')),
            add(r('t'), call(lo(lo(l(frames), sub(r('_for_of_index'), l(1))), l('t')), [])),
            r('state'),
            r('begin'),
            r('end'),
          ])),
          // _t += Infinity;
          w('t', add(r('t'), l(Infinity))),
        ], [
          // t -= value.t();
          w('t', sub(r('t'), call(lo(r('value'), l('t')), []))),
        ]),
      ]),
      // Hack around over-aggressive optimization that would get rid of some _t
      // assignments.
      branch(r('t'), []),
      // return out;
      r('out'),
    ]),
    a: func(['a', 't', 'state', 'begin', 'end'], [
      w('sum', call(l(func(['frames'], [
        w('s', l(0)),
        for_of(frames, ['_', 'value'], [
          w('s', add(r('s'), call(lo(r('value'), l('t')), []))),
        ]),
        r('s'),
      ])), [r('frames')])),
      w('out', r('state')),
      w('t', max(min(mul(r('t'), r('sum')), l(1)), l(0))),
      for_of(frames, ['_', 'value'], [
        w('t', sub(r('t'), call(lo(r('value'), l('t')), []))),
        branch(lte(r('t'), l(0)), [
          w('out', call(lo(r('value'), l('a')), [
            or(
              lo(l(frames), add(r('_for_of_index'), l(1))),
              r('a')
            ),
            add(r('t'), call(lo(r('value'), l('t')), [])),
            r('state'),
            r('begin'),
            r('end'),
          ])),
          w('t', add(r('t'), l(Infinity))),
        ]),
      ]),
      branch(r('t'), []),
      r('out'),
    ]),
    eq: func(['t', 'state', 'begin', 'end'], [
      gte(r('t'), l(1)),
    ]),
  })
));
keyframes.args = keyframesArgs;

const frameArgs = [['timer', 'fn'], r('timer'), r('fn')];
const frame = ast.context(({
  methods, func, call, l, r, lo,
}) => (timer, fn) => (
  methods({
    main: func(['t', 'state', 'begin', 'end'], [
      call(l(fn), [
        call(l(timer), [r('t')]),
        r('state'),
        r('begin'),
        r('end'),
      ]),
    ]),
    a: func(['a', 't', 'state', 'begin', 'end'], [
      call(lo(l(fn), l('a')), [
        r('a'),
        call(l(timer), [r('t')]),
        r('state'),
        r('begin'),
        r('end'),
      ]),
    ]),
    t: func([], [
      call(lo(l(timer), l('t')), []),
    ]),
    eq: func(['t', 'state', 'begin', 'end'], [
      call(lo(l(fn), l('eq')), [
        call(l(timer), [r('t')]),
        r('state'),
        r('begin'),
        r('end'),
      ]),
    ]),
  })
));
frame.args = frameArgs;

const secondsArgs = [['seconds', 'fn'], r('seconds'), r('fn')];
const seconds = ast.context(({
  methods, func, div, r, l,
}) => (seconds, fn) => (
  frame(methods({
    main: func(['t'], [
      div(r('t'), l(seconds)),
    ]),
    t: func([], [l(seconds)]),
  }), fn)
));
seconds.args = secondsArgs;

const msArgs = [['ms', 'fn'], r('ms'), r('fn')];
const ms = ast.context(({
  methods, func, div, r, l, w,
}) => (ms, fn) => (
  frame(methods({
    main: func(['t'], [
      w('denom', div(l(ms), l(1000))),
      div(r('t'), r('denom')),
    ]),
    t: func([], [div(l(ms), l(1000))]),
  }), fn)
));
ms.args = msArgs;

const percentArgs = [['percent', 'fn'], r('percent'), r('fn')];
const percent = ast.context(({
  methods, func, div, r, l, w,
}) => (percent, fn) => (
  frame(methods({
    main: func(['t'], [
      w('denom', div(l(percent), l(100))),
      div(r('t'), r('denom')),
    ]),
    t: func([], [div(l(percent), l(100))]),
  }), fn)
));
percent.args = percentArgs;

const keyframes_exampleArgs = [[]];
const keyframes_example = () => duration(keyframes([
  seconds(0.999, constant(0)),
  seconds(0.001, constant(1)),
]), 1);
keyframes_example.args = keyframes_exampleArgs;

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
  keyframes,
  frame,
  seconds,
  ms,
  percent,
  keyframes_example,
};
