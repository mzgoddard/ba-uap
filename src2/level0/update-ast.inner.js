const _ast = require('./function-ast');
const astRegistry = require('./ast-registry');
const ast = astRegistry(_ast);

const r = _ast.r;

const valueArgs = [['fn'], r('fn')];
const value = ast.context(({
  methods, func, call, l, r
}) => fn => (
  methods({
    main: func(['element', 'state', 'animated'], [
      call(l(fn), [r('element'), r('state'), r('animated')]),
    ]),
    copy: fn.copy || fn.methods && fn.methods.copy || func(['dest', 'src'], [r('src')]),
  })
));
value.args = valueArgs;

const identityArgs = [[]];
const identity = ast.context(({
  func, r
}) => () => (
  value(func(['state'], [r('state')]))
));
identity.args = identityArgs;

const constantArgs = [['c'], r('c')];
const constant = ast.context(({
  func, l
}) => c => (
  value(func([], [l(c)]))
));
constant.args = constantArgs;

const propertyArgs = [['key'], r('key')];
const property = ast.context(({
  func, lo, r, l,
}) => key => (
  value(func(['element'], [lo(r('element'), l(key))]))
));
property.args = propertyArgs;

const walker = ast.context(({
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

const objectArgs = [['obj'], r('obj')];
const object = ast.context(({
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
object.args = objectArgs;

const elementsArgs = [['obj'], r('obj')];
const elements = ast.context(({
  methods, func, w, r, or, l, for_of, st, call, lo
}) => obj => (
  walker(obj, [
    w('state', or(r('state'), l({}))),
    for_of(obj, ['key', 'value'], [
      st(r('state'), r('key'), call(
        r('value'),
        [
          lo(lo(lo(lo(r('animated'), l('animated')), l('elements')), r('key')), l('element')),
          r('state'),
          r('animated'),
        ]
      )),
    ]),
    r('state'),
  ])
));
elements.args = elementsArgs;

const propertiesArgs = [['obj'], r('obj')];
const properties = ast.context(({
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
properties.args = propertiesArgs;

const asElementArgs = [['a', 'b'], r('a'), r('b')];
const asElement = ast.context(({
  methods, func, call, l, r
}) => (a, b) => (
  methods({
    main: func(['element', 'state', 'animated'], [
      // b(a(element, state, animated), state, animated)
      call(l(b), [call(l(a), [r('element'), r('state'), r('animated')]), r('state'), r('animated')]),
    ]),
    copy: b.copy || b.methods && b.methods.copy || func(['dest', 'src'], [r('src')]),
  })
));
asElement.args = asElementArgs;

const rectCopyObj = {
  left: identity(),
  top: identity(),
  right: identity(),
  bottom: identity(),
  width: identity(),
  height: identity(),
};


const rectArgs = [[]];
const rect = ast.context(({
  methods, func, w, call, lo, r, l, st, add, or, for_of,
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
      // call(l('console.log'), [r('rect')]),
      r('rect'),
    ]),
    copy: func(['dest', 'src'], [
      w('dest', or(r('dest'), l({}))),
      for_of(rectCopyObj, ['key', 'value'], [
        st(r('dest'), r('key'), lo(r('src'), r('key'))),
      ]),
      r('dest'),
    ]),
  })
));
rect.args = rectArgs;

const shouldArgs = [['fn', 'compare'], r('fn'), r('compare')];
const should = ast.context(({
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
should.args = shouldArgs;

module.exports = {
  value,
  identity,
  constant,
  property,
  object,
  elements,
  properties,
  asElement,
  byElement: asElement,
  rect,
  should,
};
