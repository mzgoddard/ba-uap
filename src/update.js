import builder from './function-registry';

const update = builder(() => {
  const value = fn => {
    const f = (element, state, animated) => {
      return fn(element, state, animated);
    };
    if (fn.copy) {
      f.copy = (dest, src) => {
        return fn.copy(dest, src);
      };
    }
    else {
      f.copy = (dest, src) => {
        return src;
      };
    }
    return f;
  };

  const identity = () => value(element => element);
  const constant = c => value(() => c);

  const object = o => {
    const entries = Object.entries(o);
    const f = (element, state, animated) => {
      state = state || {};
      for (let [key, value] of entries) {
        state[key] = value(element, state[key], animated);
      }
      return state;
    };
    f.copy = (dest, src) => {
      dest = dest || {};
      for (let [key, value] of entries) {
        dest[key] = value.copy(dest[key], src[key]);
      }
      return dest;
    };
    f.o = o;
    return f;
  };

  const elements = o => {
    const entries = Object.entries(o);
    const f = (element, state, animated) => {
      state = state || {};
      for (let [key, value] of entries) {
        state[key] = value(animated.animated[elements].element, state, animated);
      }
      return state;
    };
    f.copy = (dest, src) => {
      dest = dest || {};
      for (let [key, value] of entries) {
        dest[key] = value.copy(dest[key], src[key]);
      }
      return dest;
    };
    f.o = o;
    return f;
  };

  const properties = o => {
    const entries = Object.entries(o);
    const f = (element, state, animated) => {
      state = state || {};
      for (let [key, value] of entries) {
        state[key] = value(element[key], state, animated);
      }
      return state;
    };
    f.copy = (dest, src) => {
      dest = dest || {};
      for (let [key, value] of entries) {
        dest[key] = value.copy(dest[key], src[key]);
      }
      return dest;
    };
    f.o = o;
    return f;
  };

  const byElement = (a, b) => {
    const f = (element, state, animated) => {
      return b(a(element, state, animated), state, animated);
    };
    f.copy = (dest, src) => {
      return b.copy(dest, src);
    };
    return f;
  };

  const rectUpdate = properties({
    left: identity(),
    top: identity(),
    width: identity(),
    height: identity(),
  });

  const rect = () => {
    return byElement(element => element.getBoundingClientRect(), rectUpdate);
  };

  return {
    value,
    identity,
    constant,

    object,
    properties,
    elements,

    byElement,

    rect,
  };
}).freeze();

export const value = update.value;
export const identity = update.identity;
export const object = update.object;
export const properties = update.properties;
export const elements = update.elements;
export const byElement = update.byElement;
export const rect = update.rect;

export default update;
