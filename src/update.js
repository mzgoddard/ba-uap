export const property = key => {
  if (typeof key === 'string') {
    return (element, state, animated) => {
      return element[key];
    };
  }
  else {
    return (element, state, animated) => {
      return key(element, state, animated);
    };
  }
};

// assert.equal(property('left')({left: 1}, {}, {}), 1);
// assert.equal(property(element => element.left)({left: 1}, {}, {}), 1);

export const rect = fn => property((element, state, animated) => fn(element.getClientBoundingRect(), state, animated));

// assert.equal(rect(state => state.left)({getClientBoundingRect() {return {left: 1};}}, {}, {}), 1);

export const object = o => {
  const entries = Object.entries(o);
  const f = (element, state, animated) => {
    state = state || {};
    for (let [key, value] of entries) {
      state[key] = value(element, state[key], animated);
    }
    return state;
  };
  return f;
};

// assert.equal(object({left: element => element.left})({left: 1}, {}, {}).left, 1);

export const properties = o => {
  const entries = Object.entries(o);
  const f = (element, state, animated) => {
    for (let [key, value] of entries) {
      value(element[key], state, animated);
    }
    return state;
  };
  return f;
};

// assert.equal(properties({styles: object({left: styles => styles.left})})({styles: {left: 1}}, {}, {}).left, 1);

export const elements = o => {
  const entries = Object.entries(o);
  const f = (element, state, animated) => {
    for (let [key, value] of entries) {
      value(animated.elements[key].element, state, animated.elements[key]);
    }
    return state;
  };
  return f;
};

// assert.equal(elements({leg: object({id: property('id')})})({}, {}, {elements: {leg: {element: {id: 1}}}}).id, 1);

export default {
  elements,
  object,
  properties,
  property,
  rect,
};
