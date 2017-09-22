const create = require('./ast-registry');
const baseAst = require('./function-ast');

const base = create(baseAst)
const update = create({}, base);

const register = (n, args, fn) => update.register(n, args, update.context(fn));

const value = register('value', [['fn'], base.r('fn')], ({
  methods, func, call, l, r
}) => fn => (
  methods({
    main: func(['element', 'state', 'animated'], [
      call(l(fn), [r('element'), r('state'), r('animated')]),
    ]),
    copy: fn.copy || fn.methods && fn.methods.copy || func(['dest', 'src'], [r('src')]),
  })
));

const identity = register('identity', [[]], ({
  func, r
}) => () => (
  value(func(['state'], [r('state')]))
));

const constant = register('constant', [['c'], base.r('c')], ({
  func, l
}) => c => (
  value(func([], [l(c)]))
));

const property = register('property', [['key'], base.r('key')], ({
  value, func, lo, r, l
}) => key => (
  value(func(['element'], [lo(r('element'), l(key))]))
));

const walker = update.context(({
  methods, func, w, r, or, l, for_of, st, call, lo
}) => (obj, _walk) => (
  methods({
    main: func(['element', 'state', 'animated'], _walk),
    copy: func(['dest', 'src'], [
      w('dest', or(r('dest'), l({}))),
      for_of(obj, ['key', 'value'], [
        st(r('dest'), r('key'), lo(r('src'), r('key'))),
      ]),
      r('dest'),
    ]),
  })
));

const object = register('object', [['obj'], base.r('obj')], ({
  methods, func, w, r, or, l, for_of, st, call, lo
}) => obj => (
  walker(obj, [
    w('state', or(r('state'), l({}))),
    for_of(obj, ['key', 'value'], [
      st(r('state'), r('key'), call(
        r('value'),
        [
          r('element'),
          lo(r('state'), r('key')),
          r('animated'),
        ]
      )),
    ]),
    r('state'),
  ])
));

const elements = register('elements', [['obj'], base.r('obj')], ({
  methods, func, w, r, or, l, for_of, st, call, lo
}) => obj => (
  walker(obj, [
    w('state', or(r('state'), l({}))),
    for_of(obj, ['key', 'value'], [
      st(r('state'), r('key'), call(
        r('value'),
        [
          lo(lo(lo(r('animated'), l('animated')), r('key')), l('element')),
          r('state'),
          r('animated'),
        ]
      )),
    ]),
    r('state'),
  ])
));

const properties = register('properties', [['obj'], base.r('obj')], ({
  methods, func, w, r, or, l, for_of, st, call, lo
}) => obj => (
  walker(obj, [
    // state = state || {};
    w('state', or(r('state'), l({}))),
    // for (const [key, value] of Object.entries(obj))
    for_of(obj, ['key', 'value'], [
      // state[key] = value(element[key], state, animated)
      st(r('state'), r('key'), call(
        r('value'),
        [
          lo(r('element'), r('key')),
          r('state'),
          r('animated'),
        ]
      )),
    ]),
    r('state'),
  ])
));

const asElement = register('asElement', [['a', 'b'], base.r('a'), base.r('b')], ({
  methods, func, call, l, r
}) => (a, b) => (
  methods({
    main: func(['element', 'state', 'animated'], [
      // b(a(element, state, animated), state, animated)
      call(l(b), [call(l(a), [r('element'), r('state'), r('animated')]), , r('state'), r('animated')]),
    ]),
    copy: b.copy || b.methods && b.methods.copy || func(['dest', 'src'], [r('src')]),
  })
));

const rect = register('rect', [[]], ({
  methods, func, w, call, lo, r, l, st, add, or
}) => () => (
  methods({
    main: func(['element', 'state'], [
      // _rect = element.getBoundingClientRect()
      w('_rect', call(lo(r('element'), l('getBoundingClientRect')), [])),
      // _scrollLeft = element.scrollLeft
      w('_scrollLeft', lo(r('element'), l('scrollLeft'))),
      // _scrollTop = element.scrollTop
      w('_scrollTop', lo(r('element'), l('scrollTop'))),
      // rect = state || {}
      w('rect', or(r('state'), l({}))),
      // rect.left = _rect.left + _scrollLeft
      st(r('rect'), l('left'), add(lo(r('_rect'), l('left')), r('_scrollLeft'))),
      // rect.top = _rect.top + _scrollTop
      st(r('rect'), l('top'), add(lo(r('_rect'), l('top')), r('_scrollTop'))),
      // rect.right = _rect.right + _scrollRight
      st(r('rect'), l('right'), add(lo(r('_rect'), l('right')), r('_scrollLeft'))),
      // rect.bottom = _rect.bottom + _scrollBottom
      st(r('rect'), l('bottom'), add(lo(r('_rect'), l('bottom')), r('_scrollTop'))),
      // rect.width = _rect.width
      st(r('rect'), l('width'), lo(r('_rect'), l('width'))),
      // rect.height = _rect.height
      st(r('rect'), l('height'), lo(r('_rect'), l('height'))),
      r('rect'),
    ]),
    copy: func(['dest', 'src'], [
      w('dest', or(r('dest'), l({}))),
      for_of(obj, ['key', 'value'], [
        st(r('dest'), r('key'), lo(r('src'), r('key'))),
      ]),
      r('dest'),
    ]),
  })
));

const should = register('should', [['fn', 'compare'], base.r('fn'), base.r('compare')], ({
  methods, func, call, l, r, lo
}) => (fn, compare) => (
  methods({
    main: func(['element', 'state', 'animated'], [
      call(l(fn), [r('element'), r('state'), r('animated')]),
    ]),
    copy: func(['dest', 'src'], [
      call(lo(lo(l(fn), l('methods')), l('copy')), [r('dest'), r('src')])
    ]),
    should: func(['a', 'b'], [
      call(l(compare), [r('a'), r('b')]),
    ]),
  })
));

module.exports = update;
