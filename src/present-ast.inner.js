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

const beginArgs = [['fn'], r('fn')];
const begin = ast.context(({
  func, call, lo, l, or,
}) => fn => (
  value(func(['state', 'animated'], [
    call(lo(l(fn), l('value')), [
      or(lo(r('animated'), l('_begin')), lo(r('animated'), l('begin'))),
      r('animated'),
    ]),
  ]))
));
begin.args = beginArgs;

const endArgs = [['fn'], r('fn')];
const end = ast.context(({
  func, call, lo, l, or,
}) => fn => (
  value(func(['state', 'animated'], [
    call(lo(l(fn), l('value')), [
      or(lo(r('animated'), l('_end')), lo(r('animated'), l('end'))),
      r('animated'),
    ]),
  ]))
));
end.args = endArgs;

const againstArgs = [['a', 'op', 'b'], r('a'), ast.context(({
  func, call, l, r, lo,
}) => (a, b) => value(func(['state', 'animated'], [
  call(
    lo(call(l(r('op')), [a, b]), l('value')),
    [r('state'), r('animated')]
  )
]))), ast.context(({
  func, call, l, r, lo,
}) => a => call(l(r('b')), [a]))];
const against = ast.context(({
  func, call, lo, l, r, w,
}) => (a, op, b) => (
  value(func(['state', 'animated'], [
    call(
      lo(l(op(a, b(a))), l('value')),
      [r('state'), r('animated')]
    ),
  ]))
));
against.args = againstArgs;

// sub(constant(1), constant(2))

const toArgs = [['a', 'b'], r('a'), ast.context(({
  func, call, l, r, lo,
}) => a => value(func(['state', 'animated'], [
  call(
    lo(call(l(r('b')), [a]), l('value')),
    [r('state'), r('animated')]
  )
])))];
const to = (a, b) => against(a, sub, b);
to.args = toArgs;

const overArgs = [['a', 'b'], r('a'), ast.context(({
  func, call, l, r, lo,
}) => a => value(func(['state', 'animated'], [
  call(
    lo(call(l(r('b')), [a]), l('value')),
    [r('state'), r('animated')]
  )
])))];
const over = (a, b) => against(a, div, b);
over.args = overArgs;

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

const propertiesArgs = [['o'], r('o')];
const properties = ast.context(({
  methods, func, for_of, st, r, call, or, lo, l, w,
}) => o => (
  methods({
    main: func(['element', 'state', 'animated'], [
      for_of(o, ['key', 'value'], [
        // element[key] = value(element[key], state, animated)
        st(r('element'), r('key'), call(
          r('value'),
          [lo(r('element'), r('key')), r('state'), r('animated')]
        )),
      ]),
      r('element'),
    ]),
    store: func(['state', 'element', 'animated'], [
      w('state', or(r('state'), l({}))),
      for_of(o, ['key', 'value'], [
        st(r('state'), r('key'), call(
          lo(r('value'), l('store')),
          [lo(r('state'), r('key')), lo(r('element'), r('key')), r('animated')],
        )),
      ]),
      r('state'),
    ]),
    restore: func(['element', 'state', 'animated'], [
      for_of(o, ['key', 'value'], [
        st(r('element'), r('key'), call(
          lo(r('value'), l('restore')),
          [lo(r('element'), r('key')), lo(r('state'), r('key')), r('animated')],
        )),
      ]),
      r('element'),
    ]),
  })
));
properties.args = propertiesArgs;

const styleArgs = [['styles'], r('styles')];
const style = styles => properties({style: properties(styles)});
style.args = styleArgs;

const elementsArgs = [['o'], r('o')];
const elements = ast.context(({
  methods, func, for_of, st, r, call, or, lo, l, w,
}) => o => (
  methods({
    main: func(['element', 'state', 'animated'], [
      for_of(o, ['key', 'value'], [
        // value(..., state, animated)
        call(r('value'), [
          // animated.animated.elements[key].element
          lo(lo(lo(lo(r('animated'), l('animated')), l('elements')), r('key')), l('element')),
          r('state'),
          r('animated'),
        ]),
      ]),
      r('element'),
    ]),
    store: func(['state', 'element', 'animated'], [
      w('state', or(r('state'), l({}))),
      for_of(o, ['key', 'value'], [
        st(r('state'), r('key'), call(lo(r('value'), l('store')), [
          lo(r('state'), r('key')),
          lo(lo(lo(lo(r('animated'), l('animated')), l('elements')), r('key')), l('element')),
          r('animated'),
        ])),
      ]),
      r('state'),
    ]),
    restore: func(['element', 'state', 'animated'], [
      for_of(o, ['key', 'value'], [
        call(lo(r('value'), l('restore')), [
          lo(lo(lo(lo(r('animated'), l('animated')), l('elements')), r('key')), l('element')),
          lo(r('state'), r('key')),
          r('animated'),
        ]),
      ]),
      r('element'),
    ]),
  })
));
elements.args = elementsArgs;

const objectArgs = [['o'], r('o')];
const object = ast.context(({
  methods, func, for_of, st, r, call, or, lo, l, w,
}) => o => (
  methods({
    main: func(['element', 'state', 'animated'], [
      for_of(o, ['key', 'value'], [
        w('_begin', or(lo(r('animated'), l('_begin')), lo(r('animated'), l('begin')))),
        st(r('animated'), l('_begin'), lo(r('_begin'), r('key'))),
        w('_end', or(lo(r('animated'), l('_end')), lo(r('animated'), l('end')))),
        st(r('animated'), l('_end'), lo(r('_end'), r('key'))),
        // value(element, state[key], animated)
        call(r('value'), [
          r('element'),
          lo(r('state'), r('key')),
          r('animated'),
        ]),
        st(r('animated'), l('_begin'), r('_begin')),
        st(r('animated'), l('_end'), r('_end')),
      ]),
      r('element'),
    ]),
    store: func(['state', 'element', 'animated'], [
      for_of(o, ['key', 'value'], [
        call(lo(r('value'), l('store')), [
          r('state'), r('element'), r('animated'),
        ]),
      ]),
      r('state'),
    ]),
    restore: func(['element', 'state', 'animated'], [
      for_of(o, ['key', 'value'], [
        call(lo(r('value'), l('restore')), [
          r('element'), r('state'), r('animated'),
        ]),
      ]),
      r('element'),
    ]),
  })
));
object.args = objectArgs;

module.exports = {
  value,
  constant,
  key,
  em, percent, deg, rad, px, rem, vh, vmax, vmin, vw,
  add, sub, mul, div,
  begin, end, against, to, over,
  concat,
  translate, translatex, translatey, translatez, translate3d,
  rotate, rotatex, rotatey, rotatez, rotate3d,
  scale, scalex, scaley, scalez, scale3d,
  properties,
  style,
  elements,
  object,
};
