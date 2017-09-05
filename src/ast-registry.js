const compile = require('./function-ast.2step');
const run = require('./function-ast.vm');
const asfunc = require('./function-ast.interactive');
const funcRegistry = require('./function-registry');

const create = (fn, constructor = {}) => {
  function PresentFunction(f) {
    return Object.setPrototypeOf(f, PresentFunction.prototype);
  }
  PresentFunction.prototype = Object.create(Function.prototype);
  PresentFunction.prototype.constructor = PresentFunction;

  PresentFunction.prototype.asfunc = function() {return asfunc(this);};

  function PresentObject(f) {
    return Object.setPrototypeOf(f, PresentObject.prototype);
  }
  PresentObject.prototype = Object.create(Object.prototype);
  PresentObject.prototype.constructor = PresentObject;

  PresentObject.prototype.compile = function(options) {
    return compile(this, options);
  };
  PresentObject.prototype.run = function(method, ...args) {
    return run(this, method, ...args);
  };

  const registry = {};
  const present = Object.create(constructor);
  Object.defineProperties(present, {
    create: {
      enumerable: false,
      value(fn, constructor) {
        if (typeof fn === 'function') {
          return create(() => Object.assign({}, registry, fn()), constructor);
        }
        else {
          return create(Object.assign({}, registry, fn), constructor);
        }
      },
    },
    funcRegistry: {
      enumerable: false,
      value() {
        const o = {};
        Object.entries(present).forEach(([key, value]) => {
          o[key] = value.asfunc();
        });
        return funcRegistry(o);
      },
    },
    register: {
      enumerable: false,
      value(key, args, fn) {
        if (typeof args === 'function') {
          fn = args;
          args = undefined;
        }
        if (args) {
          fn.args = args;
        }
        registry[key] = fn;
        // if (process.env.NODE_ENV !== 'production' && registry[key] !== fn) {
        //   throw new Error('Cannot register on a frozen animation builder');
        // }
        present[key] = new PresentFunction(function(...args) {
          args.forEach(a => {
            if (Object.getPrototypeOf(a) === PresentObject.prototype) {
              Object.setPrototypeOf(a, Object.prototype);
            }
          });
          return new PresentObject(fn.call(this, ...args));
        });
        present[key].args = args;
        PresentFunction.prototype[key] = new PresentFunction(function(...args) {
          args.forEach(a => {
            if (Object.getPrototypeOf(a) === PresentObject.prototype) {
              Object.setPrototypeOf(a, Object.prototype);
            }
          });
          return new PresentObject(fn.call(this, this, ...args));
        });
        PresentFunction.prototype.args = args;
        PresentObject.prototype[key] = new PresentFunction(function(...args) {
          args.forEach(a => {
            if (Object.getPrototypeOf(a) === PresentObject.prototype) {
              Object.setPrototypeOf(a, Object.prototype);
            }
          });
          return new PresentObject(fn.call(this, this, ...args));
        });
        return present[key];
      },
    },
    cast: {
      enumerable: false,
      value(fn) {
        return new PresentFunction(function(...args) {
          return new PresentFunction(fn.bind())();
        });
      },
    },
    context: {
      enumerable: false,
      value(fn) {
        return fn(present);
      },
    },
    freeze: {
      enumerable: false,
      value() {
        Object.freeze(registry);
        Object.freeze(present);
        Object.freeze(PresentFunction.prototype);
        Object.freeze(PresentObject.prototype);
        return present;
      },
    },
  });

  let obj = fn;
  if (typeof fn === 'function') {
    obj = fn();
  }
  for (let key in obj) {
    present.register(key, obj[key].args, obj[key]);
  }

  return present;
};

module.exports = create;
module.exports.create = create;
