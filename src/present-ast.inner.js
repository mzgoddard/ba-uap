const _ast = require('./function-ast');
const astRegistry = require('./ast-registry');
const ast = astRegistry(_ast);

const r = _ast.r;

const valueArgs = [['fn'], r('fn')];
const value = ast.context(({
  methods, func, call, l, r, or, lo, w, branch,
}) => fn => (
  // call(func([], [
    // w('_fn', or(lo(l(fn), l('value')), l(fn))),
    methods({
      main: func(['element', 'state', 'animated'], [
        call(l(fn), [r('state'), r('animated')]),
      ]),
      value: func(['state', 'animated'], [
        call(l(fn), [r('state'), r('animated')]),
      ]),
      store: func(['state', 'element'], [
        r('element'),
      ]),
      restore: func(['element', 'state'], [
        r('state'),
      ]),
    })
  // ]), [])
));
value.args = valueArgs;

const constantArgs = [['c'], r('c')];
const constant = ast.context(({
  func, l,
}) => c => value(func([], [l(c)])));
constant.args = constantArgs;

const keyArgs = [['key'], r('key')];
const key = ast.context(({
  func, lo, r, l,
}) => key => value(func(['state'], [lo(r('state'), l(key))])));
key.args = keyArgs;

// const pathArgs = [[], ];

const suffixArgs = [['fn', 'suffix'], r('fn'), r('suffix')];
const suffix = ast.context(({
  func, add, call, l, r, or, lo,
}) => (fn, suffix) => (
  value(func(['state', 'animated'], [
    add(call(or(lo(l(fn), l('value')), l(fn)), [r('state'), r('animated')]), l(suffix))
  ]))
));
suffix.args = suffixArgs;

const [em, percent, deg, rad, px, rem, vh, vmax, vmin, vw] =
  ['em', 'percent', 'deg', 'rad', 'px', 'rem', 'vh', 'vmax', 'vmin', 'vw']
  .map(s => {
    const f = fn => suffix(fn, s);
    f.args = [['fn'], r('fn')];
    return f;
  });

const op = ast.context(({
  func, call, lo, l, r,
}) => o => {
  const f = (a, b) => (
    value(func(['state', 'animated'], [
      o(
        call(lo(l(a), l('value')), [r('state'), r('animated')]),
        call(lo(l(b), l('value')), [r('state'), r('animated')])
      )
    ]))
  );
  f.args = [['a', 'b'], r('a'), r('b')];
  return f;
});

const [add, sub, mul, div] = ast.context(({
  add, sub, mul, div
}) => [add, sub, mul, div].map(op));

const concatArgs = [['ary'], r('ary')];
const concat = ast.context(({
  func, w, l, for_of, add, r, call, or, lo,
}) => ary => (
  // function(state, animated) {
  value(func(['state', 'animated'], [
    // var s = ""
    w('s', l('')),
    // for (const fn of ary) {
    for_of(ary, ['i', 'fn'], [
      // s = s + (fn.value || fn)(state, animated)
      w('s', add(r('s'), call(or(lo(r('fn'), l('value')), r('fn')), [
        r('state'), r('animated'),
      ]))),
    ]),
    // return s
    r('s')
  ]))
));
concat.args = concatArgs;

const func = name => ast.context(({
  func, w, l, for_of, add, call, or, lo, r, not_last,
}) => ary => (
  concat([
    concat([constant(name), constant('(')]),
    // function(state, animated) {
    value(func(['state', 'animated'], [
      // s = ""
      w('s', l('')),
      // for (const fn of ary) {
      for_of(ary, ['i', 'fn'], [
        // s = s + (fn.value || fn)(state, animated)
        w('s', add(r('s'), call(or(lo(r('fn'), l('value')), r('fn')), [
          r('state'), r('animated'),
        ]))),
        // s = s + (i < ary.length - 1 ? ", " : "")
        w('s', add(r('s'), not_last(l(', '), l('')))),
      ]),
      // return s
      a.r('s'),
    ])),
    constant(')')
  ])
));

const [
  translate, translatex, translatey, translatez, translate3d,
  rotate, rotatex, rotatey, rotatez, rotate3d,
  scale, scalex, scaley, scalez, scale3d
] =
  [
    'translate', 'translatex', 'translatey', 'translatez', 'translate3d',
    'rotate', 'rotatex', 'rotatey', 'rotatez', 'rotate3d',
    'scale', 'scalex', 'scaley', 'scalez', 'scale3d'
  ]
  .map(f => {
    const _result = func(f);
    _result.args = [['ary'], r('ary')];
    return _result;
  });

module.exports = {
  value,
  constant,
  key,
  em, percent, deg, rad, px, rem, vh, vmax, vmin, vw,
  add, sub, mul, div,
  concat,
  translate, translatex, translatey, translatez, translate3d,
  rotate, rotatex, rotatey, rotatez, rotate3d,
  scale, scalex, scaley, scalez, scale3d,
};
