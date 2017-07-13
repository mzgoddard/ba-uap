export const create = (fn, constructor = {}) => {
  function PresentFunction(f) {
    return Object.setPrototypeOf(f, PresentFunction.prototype);
  }
  PresentFunction.prototype = Object.create(Function.prototype);
  PresentFunction.prototype.constructor = PresentFunction;

  const registry = {};
  const present = Object.assign(constructor, {
    create(fn, constructor) {
      if (typeof fn === 'function') {
        return create(() => Object.assign({}, registry, fn()), constructor);
      }
      else {
        return create(Object.assign({}, registry, fn), constructor);
      }
    },
    register(key, fn) {
      registry[key] = fn;
      if (registry[key] !== fn) {
        throw new Error('Cannot register on a frozen animation builder');
      }
      present[key] = new PresentFunction(function(...args) {
        return new PresentFunction(fn.call(this, ...args));
      });
      PresentFunction.prototype[key] = new PresentFunction(function(...args) {
        return new PresentFunction(fn.call(this, this, ...args));
      });
    },
    cast(fn) {
      return new PresentFunction(function(...args) {
        return new PresentFunction(fn.bind())();
      });
    },
    freeze() {
      Object.freeze(registry);
      Object.freeze(present);
      Object.freeze(PresentFunction.prototype);
      return present;
    },
  });

  let obj = fn;
  if (typeof fn === 'function') {
    obj = fn();
  }
  for (let key in obj) {
    present.register(key, obj[key]);
  }

  return present;
};

export default create;
