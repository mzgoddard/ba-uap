var BoxArt = BoxArt || {}; BoxArt["functions"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var compile = __webpack_require__(3).default;
var guessKeys = __webpack_require__(3).guessKeys;
var funcRegistry = __webpack_require__(10);

var lazyCompile = function lazyCompile(fn, registry) {
  fn._compiled = fn._compiled || compile(fn, registry)()();
  return fn._compiled;
};

var lazyCall = function lazyCall(fn, registry) {
  return function () {
    // console.log(lazyCompile(fn, registry).toString())
    return lazyCompile(fn, registry).apply(undefined, arguments);
  };
};

var lazyKeyCall = function lazyKeyCall(fn, key, registry) {
  return function () {
    var _lazyCompile;

    // console.log(Object.keys(lazyCompile(fn, registry)()));
    // console.log((lazyCompile(fn, registry).toString()));
    return (_lazyCompile = lazyCompile(fn, registry))[key].apply(_lazyCompile, arguments);
  };
};

var clearNesting = function clearNesting(args) {
  args.forEach(function (a) {
    if (typeof a === 'function' && !(a instanceof Function)) {
      Object.setPrototypeOf(a, Function.prototype);
    }
  });
};

function bindDefinition(fn, autobind, registry, origin, args) {
  if (!autobind) {
    return fn;
  }
  try {
    var fake = function fake() {
      return fn.apply(undefined, arguments);
    };
    var meta = { origin: origin, args: args };
    Object.defineProperty(fake, 'meta', {
      value: meta,
      enumerable: false
    });

    var wrapped = Object.assign(lazyCall(fake, registry), fn);
    Object.defineProperty(wrapped, 'meta', {
      value: meta,
      enumerable: false
    });

    var keys = Object.keys(fn);
    if (keys.length === 0) {
      keys = guessKeys(fn);
    }
    keys.forEach(function (key) {
      wrapped[key] = lazyKeyCall(fake, key, registry);
    });

    return wrapped;
  } catch (e) {
    try {
      // Define meta to throw an error. Otherwise compiling this function will
      // loop until a maximum call stack error.
      Object.defineProperty(fn, 'meta', {
        get: function get() {
          throw e;
        },

        enumerable: false
      });
    } catch (_e) {
      throw e;
    }
    return fn;
  }
}

function inlined(fn, registry) {
  var f = function f() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    clearNesting(args);
    return bindDefinition(fn.call.apply(fn, [this].concat(args)), true, registry, fn, args);
  };
  f.__boxart_inlined = fn;
  return f;
}

var create = function create(fn) {
  var constructor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  function PresentFunction(f, original) {
    if (original) {
      f.asfunc = function () {
        return compile(original, registry)();
      };
    }
    return Object.setPrototypeOf(f, PresentFunction.prototype);
  }
  PresentFunction.prototype = Object.create(Function.prototype);
  PresentFunction.prototype.constructor = PresentFunction;

  PresentFunction.prototype.toString = function () {
    return this.asfunc().toString();
  };

  function PresentObject(f) {
    return Object.setPrototypeOf(f, PresentObject.prototype);
  }
  PresentObject.prototype = Object.create(Object.prototype);
  PresentObject.prototype.constructor = PresentObject;

  PresentObject.prototype.compile = function () {
    return compile(this, registry)();
  };
  PresentObject.prototype.toString = function () {
    return this.compile(this).toString();
  };

  var autobind = true;
  var registry = {};
  var present = Object.create(constructor);
  Object.defineProperties(present, {
    create: {
      enumerable: false,
      value: function value(fn, constructor) {
        if (typeof fn === 'function') {
          return create(function () {
            return Object.assign({}, registry, fn());
          }, constructor);
        } else {
          return create(Object.assign({}, registry, fn), constructor);
        }
      }
    },
    funcRegistry: {
      enumerable: false,
      value: function value(options) {
        var o = {};
        Object.entries(present).forEach(function (_ref) {
          var key = _ref[0],
              value = _ref[1];

          o[key] = value.asfunc(options);
        });
        return funcRegistry(o);
      }
    },
    register: {
      enumerable: false,
      value: function value(key, args, fn) {
        if (typeof args === 'function') {
          fn = args;
          args = undefined;
        }
        if (args) {
          fn.args = args;
        }
        if (fn.__boxart_inlined) {
          fn = fn.__boxart_inlined;
        }
        registry[key] = fn;
        // if (process.env.NODE_ENV !== 'production' && registry[key] !== fn) {
        //   throw new Error('Cannot register on a frozen animation builder');
        // }
        present[key] = new PresentFunction(function () {
          var _fn;

          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          clearNesting(args);
          return new PresentObject(bindDefinition((_fn = fn).call.apply(_fn, [this].concat(args)), autobind, registry, fn, args));
        }, fn);
        PresentObject.prototype[key] = PresentFunction.prototype[key] = new PresentFunction(function () {
          var _fn2;

          for (var _len3 = arguments.length, _args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            _args[_key3] = arguments[_key3];
          }

          var args = [this].concat(_args);
          clearNesting(args);
          return new PresentObject(bindDefinition((_fn2 = fn).call.apply(_fn2, [this].concat(args)), autobind, registry, fn, args));
        });
        return present[key];
      }
    },
    cast: {
      enumerable: false,
      value: function value(fn) {
        return new PresentFunction(function () {
          return new PresentFunction(fn.bind())();
        });
      }
    },
    context: {
      enumerable: false,
      value: function value(fn) {
        return fn(present);
      }
    },
    registry: {
      enumerable: false,
      value: function value() {
        return Object.freeze(Object.assign({}, registry));
      }
    },
    freeze: {
      enumerable: false,
      value: function value() {
        Object.freeze(registry);
        Object.freeze(present);
        Object.freeze(PresentFunction.prototype);
        Object.freeze(PresentObject.prototype);
        return present;
      }
    },
    disableBind: {
      enumerable: false,
      value: function value() {
        autobind = false;
        return present;
      }
    }
  });

  var obj = fn;
  if (typeof fn === 'function') {
    obj = fn();
  }
  for (var key in obj) {
    present.register(key, obj[key].args, obj[key]);
  }

  return present;
};

module.exports = create;
module.exports.create = create;
module.exports.inlined = inlined;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = BoxArt.compile;

/***/ }),
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__update__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__update___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__update__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__animate__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__animate___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__animate__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__present__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__present___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__present__);
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "update", function() { return __WEBPACK_IMPORTED_MODULE_0__update___default.a; });
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "animate", function() { return __WEBPACK_IMPORTED_MODULE_1__animate___default.a; });
/* harmony reexport (default from non-hamory) */ __webpack_require__.d(__webpack_exports__, "present", function() { return __WEBPACK_IMPORTED_MODULE_2__present___default.a; });






/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

const compileRegistry = __webpack_require__(2);
const inlined = compileRegistry.inlined;

let value = inlined(function value(fn) {
  const f = function(state, element, data) {
    return fn(state, element, data);
  };
  f.merge = function(dest, src) {
    return typeof dest === 'undefined' ? src : dest;
  };
  return f;
});

let union = inlined(function union(set) {
  const f = function(state, element, data) {
    for (const value of set) {
      state = value(state, element, data);
    }
    return state;
  };
  return f;
});

let unary = inlined(function unary(op, fn) {
  return value(function(state, element, data) {
    return op(fn(state, element, data));
  });
});

let binary = inlined(function binary(op, fn1, fn2) {
  return value(function(state, element, data) {
    return op(fn1(state, element, data), fn2(state, element, data));
  });
});

let abs = inlined(function abs(fn) {
  return unary(function(v) {return Math.abs(v);}, fn);
});

let add = inlined(function add(fn1, fn2) {
  return binary(function(a, b) {return a + b;}, fn1, fn2);
});

let sub = inlined(function sub(fn1, fn2) {
  return binary(function(a, b) {return a - b;}, fn1, fn2);
});

let mul = inlined(function mul(fn1, fn2) {
  return binary(function(a, b) {return a * b;}, fn1, fn2);
});

let div = inlined(function div(fn1, fn2) {
  return binary(function(a, b) {return a / b;}, fn1, fn2);
});

let mod = inlined(function mod(fn1, fn2) {
  return binary(function(a, b) {return a % b;}, fn1, fn2);
});

let min = inlined(function min(fn1, fn2) {
  return binary(function(a, b) {return Math.min(a, b);}, fn1, fn2);
});

let max = inlined(function max(fn1, fn2) {
  return binary(function(a, b) {return Math.max(a, b);}, fn1, fn2);
});

let eq = inlined(function eq(fn1, fn2) {
  return binary(function(a, b) {return a === b;}, fn1, fn2);
});

let ne = inlined(function ne(fn1, fn2) {
  return binary(function(a, b) {return a !== b;}, fn1, fn2);
});

let lt = inlined(function lt(fn1, fn2) {
  return binary(function(a, b) {return a < b;}, fn1, fn2);
});

let lte = inlined(function lte(fn1, fn2) {
  return binary(function(a, b) {return a <= b;}, fn1, fn2);
});

let gt = inlined(function gt(fn1, fn2) {
  return binary(function(a, b) {return a > b;}, fn1, fn2);
});

let gte = inlined(function gte(fn1, fn2) {
  return binary(function(a, b) {return a >= b;}, fn1, fn2);
});

let identity = inlined(function identity() {
  return value(function(state, element) {return element;});
});

let constant = inlined(function constant(c) {
  return value(function() {return c;});
});

let property = inlined(function property(key) {
  return value(function(state, element) {return element[key];});
});

let object = inlined(function object(obj) {
  const f = function(state, element, data) {
    state = state || {};
    for (const [key, value] of Object.entries(obj)) {
      state[key] = value(state[key], element, data);
    }
    return state;
  };
  return f;
});

let elements = inlined(function elements(obj) {
  const f = function(state, element, data) {
    state = state || {};
    const rootElement = data.animated.root.element;
    for (const [key, value] of Object.entries(obj)) {
      data.animated[key] = data.animated[key] || {};
      if (key !== 'root') {
        data.animated[key].element = rootElement.getElementsByClassName(key)[0];
      }
      state[key] = value(state[key], data.animated[key].element, data);
    }
    return state;
  };
  return f;
});

let elementArrays = inlined(function elementArrays(obj) {
  const f = function(state, element, data) {
    state = state || {};
    const rootElement = data.animated.root.element;
    for (const [key, value] of Object.entries(obj)) {
      data.animated[key] = data.animated[key] || {};
      data.animated[key].elements = data.animated[key].elements || [];
      data.animated[key].elements.length = 0;
      const elements = data.animated[key].elements;
      const children = rootElement.getElementsByClassName(key);
      const state2 = state[key] || [];
      state2.length = children.length;
      for (let i = 0; i < state2.length; i++) {
        elements.push(children[i]);
        state2[i] = value(state2[i], elements[i], data);
      }
      state[key] = state2;
    }
    return state;
  };
  f.merge = function(dest, src) {
    dest = dest || {};
    for (const [key, value] of Object.entries(obj)) {
      const _dest2 = dest[key] || [];
      const _src2 = src[key] || [];
      _dest2.length = _src2.length;
      for (let i = 0; i < _src2.length; i++) {
        _dest2[i] = value.merge ? value.merge(_dest2[i], _src2[i]) : _src2[i];
      }
      _dest2[key] = _dest2;
    }
    return dest;
  };
  return f;
});

let properties = inlined(function properties(obj) {
  const f = function(state, element, data) {
    state = state || {};
    for (const [key, value] of Object.entries(obj)) {
      state[key] = value(state, element[key], data);
    }
    return state;
  };
  return f;
});

let asElement = inlined(function asElement(a, b) {
  const f = function(state, element, data) {
    return b(state, a(state, element, data), data);
  };
  return f;
});

const rectCopyObj = {
  left: identity(),
  top: identity(),
  right: identity(),
  bottom: identity(),
  width: identity(),
  height: identity(),
};

let rect = inlined(function rect() {
  const f = function(state, element, data) {
    const _rect = element.getBoundingClientRect();
    const _scrollLeft = element.scrollLeft;
    const _scrollTop = element.scrollTop;
    const rect = state || {};
    rect.left = _rect.left + _scrollLeft;
    rect.top = _rect.top + _scrollTop;
    rect.right = _rect.right + _scrollLeft;
    rect.bottom = _rect.bottom + _scrollTop;
    rect.width = _rect.width;
    rect.height = _rect.height;
    return rect;
  };
  return f;
});

let should = inlined(function should(fn, compare) {
  const f = value(fn);
  f.should = function(a, b) {
    return compare(a, b);
  };
  return f;
});

module.exports = compileRegistry({
  value,
  union,
  unary, binary,
  abs,
  add, sub, mul, div, mod, min, max, eq, ne, lt, lte, gt, gte,
  identity,
  constant,
  property,
  object,
  elements,
  elementArrays,
  properties,
  asElement,
  rect,
  should,
});


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {var create = function create(fn) {
  var constructor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  function PresentFunction(f) {
    return Object.setPrototypeOf(f, PresentFunction.prototype);
  }
  PresentFunction.prototype = Object.create(Function.prototype);
  PresentFunction.prototype.constructor = PresentFunction;

  var registry = {};
  var present = constructor;
  Object.defineProperties(constructor, {
    create: {
      enumerable: false,
      value: function value(fn, constructor) {
        if (typeof fn === 'function') {
          return create(function () {
            return Object.assign({}, registry, fn());
          }, constructor);
        } else {
          return create(Object.assign({}, registry, fn), constructor);
        }
      }
    },
    register: {
      enumerable: false,
      value: function value(key, fn) {
        registry[key] = fn;
        if (process.env.NODE_ENV !== 'production' && registry[key] !== fn) {
          throw new Error('Cannot register on a frozen animation builder');
        }
        present[key] = new PresentFunction(function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return new PresentFunction(fn.call.apply(fn, [this].concat(args)));
        });
        PresentFunction.prototype[key] = new PresentFunction(function () {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return new PresentFunction(fn.call.apply(fn, [this, this].concat(args)));
        });
        return present[key];
      }
    },
    cast: {
      enumerable: false,
      value: function value(fn) {
        return new PresentFunction(function () {
          return new PresentFunction(fn.bind())();
        });
      }
    },
    context: {
      enumerable: false,
      value: function value(fn) {
        return fn(present);
      }
    },
    freeze: {
      enumerable: false,
      value: function value() {
        Object.freeze(registry);
        Object.freeze(present);
        Object.freeze(PresentFunction.prototype);
        return present;
      }
    },
    toString: {
      enumerable: false,
      value: function value() {
        return '{' + Object.entries(registry).map(function (_ref) {
          var key = _ref[0],
              value = _ref[1];
          return key + ': ' + String(value);
        }).join(',\n') + '}';
      }
    }
  });

  var obj = fn;
  if (typeof fn === 'function') {
    obj = fn();
  }
  for (var key in obj) {
    present.register(key, obj[key]);
  }

  return present;
};

module.exports = create;
module.exports.create = create;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * `animate` functions manipulate a state object according to the inputs t,
 * state, begin, end. As an animation steps it will call its animate function
 * with a progressing `t` value commonly being the number of seconds divided by
 * the duration of the animation.
 *
 * t is a time interval unit ranging from values 0 to 1. 
 *
 * @module animate
 * @example
 * // Return the value for this function at point t (0 to 1) with the input
 * // state, begin, end. If state is an object the value can be set directly
 * // to a member of state. The update function will ensure that state, begin,
 * // and end, have the same shape and are defined.
 * function f(t, state, begin, end) {}
 * // Return the value for this function optionally considering function b to
 * // be the target destination at t = 1. Think of this function as from `a`
 * // to `b`.
 * f.a = function(b, t, state, begin, end) {}
 * // Return true if state has reached what this function considers to be the
 * // end. Some functions may think that is t >= 1. Some functions may think
 * // that is state === end.
 * f.eq = function(t, state, begin, end) {}
 */

const compileRegistry = __webpack_require__(2);
const inlined = compileRegistry.inlined;

/**
 * Create an animate function that calls the passed function argument with t,
 * state, begin, and end return its result.
 *
 * @function value
 */
let value = inlined(function value(fn) {
  const f = function(t, state, begin, end, data) {
    return fn(t, state, begin, end, data);
  };
  return f;
});

/**
 * Create a function with the output of another animate call and a a-to-b
 * function to replace the a-to-b from the other animate call.
 *
 * @function a
 */
let toB = inlined(function toB(fn, toBFn) {
  const f = function(t, state, begin, end, data) {
    return fn(t, state, begin, end, data);
  };
  f.toB = function(b, t, state, begin, end, data) {
    return toBFn(b, t, state, begin, end, data);
  };
  return f;
});

/**
 * Create a function with the output of another animate call and an eq
 * when-animate-is-complete function to replace the eq from the other animate
 * call.
 *
 * @function done
 */
let done = inlined(function done(fn, doneFn) {
  const f = function(t, state, begin, end, data) {
    return fn(t, state, begin, end, data);
  };
  f.toB = function(b, t, state, begin, end, data) {
    return fn.toB ? fn.toB(b, t, state, begin, end, data) : fn(t, state, begin, end, data);
  };
  f.done = function(t, state, begin, end, data) {
    return doneFn(t, state, begin, end, data);
  };
  return f;
});

/**
 * Create an animate function that calls the passed function and returns the
 * result. It's a-to-b method calls the passed function and the b and
 * interpolates between them depending on `t`.
 *
 * @function lerp
 */
let lerp = inlined(function lerp(fn) {
  return done(
    toB(
      fn,
      function(b, t, state, begin, end, data) {
        const _b = fn(t, state, begin, end, data);
        const e = b(t, state, begin, end, data);
        return (e - _b) * Math.min(1, t) + _b;
      }
    ),
    function(t) {return t >= 1;}
  );
});

/**
 * Create an animate function that calls each function in the given array with
 * the same t, state, begin, and end values. This is useful to perform
 * different behaviours on the same object in the state's shape.
 *
 * @function union
 */
let union = inlined(function union(set) {
  const f = function(t, state, begin, end, data) {
    for (const value of Object.values(set)) {
      value(t, state, begin, end, data);
    }
    return state;
  };
  f.set = set;
  f.toB = function(b, t, state, begin, end, data) {
    let i = 0;
    for (const value of Object.values(set)) {
      value.toB(b.set[i], t, state, begin, end, data);
      i = i + 1;
    }
    return state;
  };
  f.done = function(t, state, begin, end, data) {
    let result = true;
    let i = 0;
    for (const value of Object.values(set)) {
      if (result && !value.done(t, state, begin, end, data)) {
        result = false;
      }
    }
    return result;
  };
  return f;
});

let unary = inlined(function unary(op, fn) {
  return value(function(t, state, begin, end, data) {
    return op(fn(t, state, begin, end, data));
  });
});

let binary = inlined(function binary(op, fn1, fn2) {
  return value(function(t, state, begin, end, data) {
    return op(fn1(t, state, begin, end, data), fn2(t, state, begin, end, data));
  });
});

/**
 * Create a function that returns the absolute value of the returned result of
 * the passed function.
 *
 * @function abs
 */
let abs = inlined(function abs(fn) {
  return unary(function(v) {return Math.abs(v);}, fn);
});

/**
 * Create a function that returns the sumed value of the returned results of
 * the two passed functions.
 *
 * @function add
 */
let add = inlined(function add(fn1, fn2) {
  return binary(function(a, b) {return a + b;}, fn1, fn2);
});

/**
 * Create a function that returns the difference of the returned results of
 * the two passed functions.
 *
 * @function sub
 */
let sub = inlined(function sub(fn1, fn2) {
  return binary(function(a, b) {return a - b;}, fn1, fn2);
});

/**
 * Create a function that returns the multiplied value of the returned results
 * of the two passed functions.
 *
 * @function mul
 */
let mul = inlined(function mul(fn1, fn2) {
  return binary(function(a, b) {return a * b;}, fn1, fn2);
});

/**
 * Create a function that returns the divided value of the returned results of
 * the two passed functions.
 *
 * @function div
 */
let div = inlined(function div(fn1, fn2) {
  return binary(function(a, b) {return a / b;}, fn1, fn2);
});

/**
 * Create a function that returns the remainder of the divided of the returned
 * results of the two passed functions.
 *
 * @function mod
 */
let mod = inlined(function mod(fn1, fn2) {
  return binary(function(a, b) {return a % b;}, fn1, fn2);
});

/**
 * Create a function that returns the minimum value of the returned results of
 * the two passed functions.
 *
 * @function min
 */
let min = inlined(function min(fn1, fn2) {
  return binary(function(a, b) {return Math.min(a, b);}, fn1, fn2);
});

/**
 * Create a function that returns the maximum value of the returned results of
 * the two passed functions.
 *
 * @function max
 */
let max = inlined(function max(fn1, fn2) {
  return binary(function(a, b) {return Math.max(a, b);}, fn1, fn2);
});

/**
 * Create a function that returns whether the returned results of
 * the two passed functions are equivalent.
 *
 * @function eq
 */
let eq = inlined(function eq(fn1, fn2) {
  return binary(function(a, b) {return a === b;}, fn1, fn2);
});

/**
 * Create a function that returns whether the returned results of
 * the two passed functions are different.
 *
 * @function ne
 */
let ne = inlined(function ne(fn1, fn2) {
  return binary(function(a, b) {return a !== b;}, fn1, fn2);
});

/**
 * Create a function that returns whether the returned result of
 * the first passed functions is less than the second passed function's result.
 *
 * @function lt
 */
let lt = inlined(function lt(fn1, fn2) {
  return binary(function(a, b) {return a < b;}, fn1, fn2);
});

/**
 * Create a function that returns whether the returned result of the first
 * passed functions is less than or equal to the second passed function's
 * result.
 *
 * @function lte
 */
let lte = inlined(function lte(fn1, fn2) {
  return binary(function(a, b) {return a <= b;}, fn1, fn2);
});

/**
 * Create a function that returns whether the returned result of
 * the first passed functions is greater than the second passed function's
 * result.
 *
 * @function gt
 */
let gt = inlined(function gt(fn1, fn2) {
  return binary(function(a, b) {return a > b;}, fn1, fn2);
});

/**
 * Create a function that returns whether the returned result of the first
 * passed functions is greater than or equal to the second passed function's
 * result.
 *
 * @function gte
 */
let gte = inlined(function gte(fn1, fn2) {
  return binary(function(a, b) {return a >= b;}, fn1, fn2);
});

/**
 * Create a function that returns the given constant value.
 *
 * @function constant
 */
let constant = inlined(function constant(c) {
  return value(function() {return c;});
});

/**
 * Create a function that returns the passed t value.
 *
 * @function t
 */
let t = inlined(function t() {
  return value(function(t) {return t;});
});

/**
 * Create a function that returns the passed state value.
 *
 * @function state
 */
let state = inlined(function state() {
  return value(function(t, state) {return state;});
});

/**
 * Create a function that passes a value between the begin and end value based
 * on the given position (pos) value. A 0 position value is the begin value. A
 * 1 position value is the end value. Any value between 0 and 1 is
 * proprotionally positioned on the line between begin and end.
 *
 * @function at
 */
let at = inlined(function at(pos) {
  return lerp(function(t, state, begin, end) {
    return (end - begin) * pos + begin;
  });
});

/**
 * Create a function that returns the begin value.
 *
 * @function begin
 */
let begin = inlined(function begin() {
  return at(0);
});

/**
 * Create a function that returns the end value.
 *
 * @function end
 */
let end = inlined(function end() {
  return at(1);
});

/**
 * Create a function that returns the value portionally based on t between the
 * first and second function in the passed array.
 *
 * @function to
 */
let to = inlined(function to(a, b) {
  return toB(function(t, state, begin, end, data) {
    return a.toB(b, t, state, begin, end, data);
  }, function(_b, t, state, begin, end, data) {
    return a.toB(_b, t, state, begin, end, data);
  });
});

/**
 * Create a function that calls the passed second argument with the key member
 * of the state, begin, and end values.
 *
 * @function get
 */
let get = inlined(function get(key, fn) {
  return value(function(t, state, begin, end, data) {
    return fn(t, state[key], begin[key], end[key], data);
  });
});

/**
 * Create a function that sets the key's member of the state value with the
 * result of the called function.
 *
 * @function set
 */
let set = inlined(function set(key, fn) {
  return value(function(t, state, begin, end, data) {
    state[key] = fn(t, state, begin, end, data);
    return state;
  });
});

/**
 * Create a function that iterates the given object's keys and values, setting
 * the state's key member by the called value function given the key member of
 * state, begin, and end.
 *
 * @function object
 */
let object = inlined(function object(obj) {
  const f = function(t, state, begin, end, data) {
    for (const [key, value] of Object.entries(obj)) {
      state[key] = value(t, state[key], begin[key], end[key], data);
    }
    return state;
  };
  f.obj = obj;
  f.toB = function(b, t, state, begin, end, data) {
    for (const [key, value] of Object.entries(obj)) {
      state[key] = value.toB(b.obj[key], t, state[key], begin[key], end[key], data);
    }
    return state;
  };
  return f;
});

/**
 * Create a function that calls the given function with every indexed member of
 * state, begin, and end.
 *
 * @function array
 */
let array = inlined(function array(fn) {
  return toB(function(t, state, begin, end, data) {
    for (let i = 0; i < state.length; i++) {
      state[i] = fn(t, state[i], begin[i], end[i], data);
    }
    return state;
  }, fn.toB || fn);
});

/**
 * Create a function that transforms t by one function and passing that into
 * the first function along with state, begin, and end.
 *
 * @function easing
 */
let easing = inlined(function easing(fn, tfn) {
  return done(toB(function(t, state, begin, end, data) {
    return fn(tfn(t, state, begin, end, data), state, begin, end, data);
  }, fn.toB || fn), function(t, state, begin, end, data) {
    return tfn(t, state, begin, end, data) >= 1;
  });
});

/**
 * Create a function that calls the passed function with t transformed by a
 * cubic ease-in function.
 *
 * @function easeIn
 */
let easeIn = inlined(function easeIn(fn) {
  return easing(fn, function(t) {return t * t * t;});
});

/**
 * Create a function that calls the passed function with t transformed by a
 * cubic ease-out function.
 *
 * @function easeOut
 */
let easeOut = inlined(function easeOut(fn) {
  return easing(fn, function(t) {return (t - 1) * (t - 1) * (t - 1) + 1;});
});

/**
 * Create a function that calls the passed function with t transformed by a
 * cubic ease-in-out function.
 *
 * @function easeInOut
 */
let easeInOut = inlined(function easeInOut(fn) {
  return easing(fn, function(t) {
    let out;
    if (t < 0.5) {
      out = 4 * t * t * t;
    }
    else {
      out = (t - 1) * (t * 2 - 2) * (t * 2 - 2) + 1;
    }
    return out;
  });
});

// const bezierC = ast.context(({
//   func, mul, l, r, w,
// }) => (
//   func(['x1', 'x2'], [
//     mul(l(3), r('x1')),
//   ])
// ));
//
// const bezierB = ast.context(({
//   func, sub, mul, l, r, w, call,
// }) => (
//   func(['x1', 'x2'], [
//     // sub(mul(l(3), r('x2')), mul(l(6), r('x1'))),
//     w('c', call(bezierC, [r('x1'), r('x2')])),
//     sub(mul(l(3), sub(r('x2'), r('x1'))), r('c')),
//   ])
// ));
//
// const bezierA = ast.context(({
//   func, sub, l, mul, r, w, call,
// }) => (
//   func(['x1', 'x2'], [
//     // sub(sub(l(1), mul(l(3), r('x2'))), mul(l(3), r('x1'))),
//     w('c', call(bezierC, [r('x1'), r('x2')])),
//     w('b', call(bezierB, [r('x1'), r('x2')])),
//     sub(sub(l(1), r('c')), r('b')),
//   ])
// ));
//
// const bezierBez = ast.context(({
//   func, mul, r, add, call, w, l,
// }) => (
//   // t * (c(x1, x2) + t * (b(x1, x2) + t * a(x1, x2)));
//   func(['t', 'x1', 'x2'], [
//     w('c', call(bezierC, [r('x1'), r('x2')])),
//     w('b', call(bezierB, [r('x1'), r('x2')])),
//     w('a', call(bezierA, [r('x1'), r('x2')])),
//     mul(
//       r('t'),
//       add(
//         r('c'),
//         mul(
//           r('t'),
//           add(
//             r('b'),
//             mul(
//               r('t'),
//               r('a')
//             )
//           )
//         )
//       )
//     ),
//   ])
// ));
//
// const bezierDeriv = ast.context(({
//   func, add, call, r, mul, l, w,
// }) => (
//   func(['t', 'x1', 'x2'], [
//     // c(x1, x2) + t * (2 * b(x1, x2) + 3 * a(x1, x2) * t);
//     w('c', call(bezierC, [r('x1'), r('x2')])),
//     w('b', call(bezierB, [r('x1'), r('x2')])),
//     w('a', call(bezierA, [r('x1'), r('x2')])),
//     add(
//       r('c'),
//       mul(
//         r('t'),
//         add(
//           mul(l(2), r('b')),
//           mul(
//             mul(l(3), r('a')),
//             r('t')
//           )
//         )
//       )
//     )
//   ])
// ));
//
// const bezierSearch = ast.context(({
//   func, w, r, l, call, loop, and, lt, gte, abs, sub, div, add, branch,
// }) => (
//   func(['t', 'x1', 'x2'], [
//     w('x', r('t')),
//     w('i', l(0)),
//     w('z', sub(call(bezierBez, [r('x'), r('x1'), r('x2')]), r('t'))),
//     loop(and(lt(r('i'), l(14)), gte(abs(r('z')), l(1e-3))), [
//       w('x', sub(r('x'), div(r('z'), call(bezierDeriv, [r('x'), r('x1'), r('x2')])))),
//       w('z', sub(call(bezierBez, [r('x'), r('x1'), r('x2')]), r('t'))),
//       w('i', add(r('i'), l(1))),
//     ]),
//     branch(r('z'), []),
//     branch(r('i'), []),
//     r('x'),
//   ])
// ));
//
// /**
//  * Create a function that calls the passed function with t transformed by a
//  * cubic bezier function.
//  *
//  * @function bezier
//  */
// const bezierArgs = [['fn', 'ax', 'ay', 'bx', 'by'], r('fn'), r('ax'), r('ay'), r('bx'), r('by')];
// const bezier = ast.context(({
//   func, call, r, l, w, methods,
// }) => (fn, ax, ay, bx, by) => (
//   easing(fn, func(['t'], [
//     call(bezierBez, [call(bezierSearch, [r('t'), l(ax), l(bx)]), l(ay), l(by)]),
//   ]))
// ));
// bezier.args = bezierArgs;

/**
 * Create a function that calls the passed function with t transformed by
 * dividing t by a given constant duration.
 *
 * @function duration
 */
let duration = inlined(function duration(fn, length) {
  return easing(fn, function(t) {return t / length});
});

/**
 * Creates a function that calls the passed function with t transformed by
 * using its remainder divided by a constant value.
 *
 * @function loop
 */
let loop = inlined(function loop(fn, loop) {
  return easing(fn, function(t) {return t / loop % 1;});
});

/**
 * Creates a function that calls the passed function with until the until
 * function returns a value greater or than 1.
 *
 * @function repeat
 */
let repeat = inlined(function repeat(fn, until) {
  return done(fn, until);
});

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
let keyframes = inlined(function keyframes(frames) {
  const f = function(_t, state, begin, end, data) {
    const sum = (function(frames) {
      let s = 0;
      for (const value of frames) {
        s = s + value.t();
      }
      return s;
    })(frames);

    let out = state;
    let t = Math.max(Math.min(_t * sum, sum), 0);
    let i = 0;
    for (const value of frames) {
      if (i > 0 && t <= 0) {
        out = frames[i - 1].toB(value, (t + frames[i - 1].t()) / frames[i - 1].t(), state, begin, end, data);
        t = t + Infinity;
      }
      else {
        t = t - value.t();
      }
      i = i + 1;
    }
    return out;
  };

  f.toB = function(b, _t, state, begin, end, data) {
    const sum = (function(frames) {
      let s = 0;
      for (const value of frames) {
        s = s + value.t();
      }
      return s;
    })(frames);

    let out = state;
    let t = Math.max(Math.min(_t * sum, sum), 0);
    let i;
    // TODO: Fix plugin to be able to safely use non constant declarations.
    i = 0;
    for (const value of frames) {
      t = t - value.t();
      if (t <= 0) {
        out = value.toB(
          frames[i + 1] || b,
          (t + value.t()) / value.t(),
          state,
          begin,
          end,
          data
        );
        t = t + Infinity;
      }
      i = i + 1;
    }
    return out;
  };

  return f;
});

let frame = inlined(function frame(timer, fn) {
  const f = function(t, state, begin, end, data) {
    return fn(timer(t), state, begin, end, data);
  };
  f.toB = function(b, t, state, begin, end, data) {
    let result;
    if (fn.toB) {
      result = fn.toB(b.fn || b, t, state, begin, end, data);
    }
    else {
      const _b = fn(t, state, begin, end, data);
      const e = b(t, state, begin, end, data);
      result = (e - _b) * Math.min(1, t) + _b;
    }
    return result;
  };
  f.t = function() {return timer.t();};
  f.fn = fn;
  return f;
});

let timer = inlined(function timer(unit) {
  const fTimer = function(t) {return t / unit;};
  fTimer.t = function() {return unit;};
  fTimer.toB = null;
  fTimer.done = null;
  return fTimer;
});

let seconds = inlined(function seconds(seconds) {
  return timer(seconds);
});

let ms = inlined(function ms(ms) {
  return timer(ms / 1000);
});

let percent = inlined(function percent(percent) {
  return timer(percent / 100);
});

module.exports = compileRegistry({
  value,
  lerp,
  union,
  toB,
  done,
  unary,
  abs,
  binary,
  add, sub, mul, div, mod, min, max, eq, ne, lt, lte, gt, gte,
  constant,
  t,
  state,
  at,
  begin,
  end,
  to,
  get,
  set,
  object,
  array,
  easing,
  easeIn,
  easeOut,
  easeInOut,
  // bezier,
  duration,
  keyframes,
  frame,
  timer,
  seconds,
  ms,
  percent,
  until: repeat,
  loop,
});


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

const compileRegistry = __webpack_require__(2);
const inlined = compileRegistry.inlined;

let value = inlined(function value(fn) {
  const f = function(element, state, data) {
    return fn(element, state, data);
  };
  return f;
});

let union = inlined(function union(set) {
  const f = function(element, state, data) {
    for (const value of set) {
      value(element, state, data);
    }
    return element;
  };
  f.store = function(store, element, data) {
    for (const value of set) {
      if (value.store) {
        value.store(store, element, data);
      }
    }
    return store;
  };
  f.restore = function(element, store, data) {
    for (const value of set) {
      if (value.restore) {
        value.restore(element, store, data);
      }
    }
    return element;
  };
  return f;
});

let constant = inlined(function constant(c) {
  return value(function() {return c;});
});

let key = inlined(function key(key) {
  return value(function(element, state) {return state[key];});
});

let unary = inlined(function unary(op, fn) {
  return value(function(state, element, data) {
    return op(fn(state, element, data));
  });
});

let binary = inlined(function binary(op, fn1, fn2) {
  return value(function(state, element, data) {
    return op(fn1(state, element, data), fn2(state, element, data));
  });
});

let abs = inlined(function abs(fn) {
  return unary(function(v) {return Math.abs(v);}, fn);
});

let add = inlined(function add(fn1, fn2) {
  return binary(function(a, b) {return a + b;}, fn1, fn2);
});

let sub = inlined(function sub(fn1, fn2) {
  return binary(function(a, b) {return a - b;}, fn1, fn2);
});

let mul = inlined(function mul(fn1, fn2) {
  return binary(function(a, b) {return a * b;}, fn1, fn2);
});

let div = inlined(function div(fn1, fn2) {
  return binary(function(a, b) {return a / b;}, fn1, fn2);
});

let mod = inlined(function mod(fn1, fn2) {
  return binary(function(a, b) {return a % b;}, fn1, fn2);
});

let min = inlined(function min(fn1, fn2) {
  return binary(function(a, b) {return Math.min(a, b);}, fn1, fn2);
});

let max = inlined(function max(fn1, fn2) {
  return binary(function(a, b) {return Math.max(a, b);}, fn1, fn2);
});

let eq = inlined(function eq(fn1, fn2) {
  return binary(function(a, b) {return a === b;}, fn1, fn2);
});

let ne = inlined(function ne(fn1, fn2) {
  return binary(function(a, b) {return a !== b;}, fn1, fn2);
});

let lt = inlined(function lt(fn1, fn2) {
  return binary(function(a, b) {return a < b;}, fn1, fn2);
});

let lte = inlined(function lte(fn1, fn2) {
  return binary(function(a, b) {return a <= b;}, fn1, fn2);
});

let gt = inlined(function gt(fn1, fn2) {
  return binary(function(a, b) {return a > b;}, fn1, fn2);
});

let gte = inlined(function gte(fn1, fn2) {
  return binary(function(a, b) {return a >= b;}, fn1, fn2);
});

let suffix = inlined(function suffix(fn, suffix) {
  return add(fn, function() {return suffix;});
});

let em = inlined(function em(fn) {
  return suffix(fn, 'em');
});

let percent = inlined(function percent(fn) {
  return suffix(fn, '%');
});

let deg = inlined(function deg(fn) {
  return suffix(fn, 'deg');
});

let rad = inlined(function rad(fn) {
  return suffix(fn, 'rad');
});

let px = inlined(function px(fn) {
  return suffix(fn, 'px');
});

let rem = inlined(function rem(fn) {
  return suffix(fn, 'rem');
});

let vh = inlined(function vh(fn) {
  return suffix(fn, 'vh');
});

let vmax = inlined(function vmax(fn) {
  return suffix(fn, 'vmax');
});

let vmin = inlined(function vmin(fn) {
  return suffix(fn, 'vmin');
});

let vw = inlined(function vw(fn) {
  return suffix(fn, 'vw');
});

let begin = inlined(function begin(fn) {
  return value(function(element, state, data) {
    return fn(element, data._begin || data.begin, data);
  });
});

let end = inlined(function end(fn) {
  return value(function(element, state, data) {
    return fn(element, data._end || data.end, data);
  });
});

let to = inlined(function to(a, b) {
  return value(function(element, state, data) {
    return sub(a, b(a))(element, state, data);
  });
});

let over = inlined(function over(a, b) {
  return value(function(element, state, data) {
    return div(a, b(a))(element, state, data);
  });
});

let concat = inlined(function concat(ary) {
  return value(function(element, state, data) {
    let s = '';
    for (const value of ary) {
      s = s + value(element, state, data);
    }
    return s;
  });
});

let func = inlined(function func(name, sep, ary) {
  return concat([
    constant(name),
    constant('('),
    value(function(element, state, data) {
      let s = '';
      let i = 0;
      for (const value of ary) {
        s = s + value(element, state, data);
        i = i + 1;
        if (i < ary.length) {
          s = s + sep;
        }
      }
      return s;
    }),
    constant(')'),
  ]);
});

let translate = inlined(function translate(ary) {
  return func('translate', ', ', ary);
});

let translatex = inlined(function translatex(ary) {
  return func('translatex', ', ', ary);
});

let translatey = inlined(function translatey(ary) {
  return func('translatey', ', ', ary);
});

let translatez = inlined(function translatez(ary) {
  return func('translatez', ', ', ary);
});

let translate3d = inlined(function translate3d(ary) {
  return func('translate3d', ', ', ary);
});

let rotate = inlined(function rotate(ary) {
  return func('rotate', ', ', ary);
});

let rotatex = inlined(function rotatex(ary) {
  return func('rotatex', ', ', ary);
});

let rotatey = inlined(function rotatey(ary) {
  return func('rotatey', ', ', ary);
});

let rotatez = inlined(function rotatez(ary) {
  return func('rotatez', ', ', ary);
});

let rotate3d = inlined(function rotate3d(ary) {
  return func('rotate3d', ', ', ary);
});

let scale = inlined(function scale(ary) {
  return func('scale', ', ', ary);
});

let scalex = inlined(function scalex(ary) {
  return func('scalex', ', ', ary);
});

let scaley = inlined(function scaley(ary) {
  return func('scaley', ', ', ary);
});

let scalez = inlined(function scalez(ary) {
  return func('scalez', ', ', ary);
});

let scale3d = inlined(function scale3d(ary) {
  return func('scale3d', ', ', ary);
});

let properties = inlined(function properties(obj) {
  const f = function(element, state, data) {
    for (const [key, value] of Object.entries(obj)) {
      value(element[key], state, data);
    }
    return element;
  };
  f.store = function(store, element, data) {
    store = store || {};
    for (const [key, value] of Object.entries(obj)) {
      if (value.store) {
        store[key] = value.store(store[key], element[key], data);
      }
    }
    return store;
  };
  f.restore = function(element, store, data) {
    for (const [key, value] of Object.entries(obj)) {
      if (value.restore) {
        value.restore(element[key], store[key], data);
      }
    }
    return element;
  };
  return f;
});

let fields = inlined(function fields(obj) {
  const f = function(element, state, data) {
    for (const [key, value] of Object.entries(obj)) {
      element[key] = value(element[key], state, data);
    }
    return element;
  };
  f.store = function(store, element, data) {
    store = store || {};
    for (const [key, value] of Object.entries(obj)) {
      if (value.store) {
        store[key] = value.store(store[key], element[key], data);
      }
    }
    return store;
  };
  f.restore = function(element, store, data) {
    for (const [key, value] of Object.entries(obj)) {
      if (value.restore) {
        element[key] = value.restore(element[key], store[key], data);
      }
    }
    return element;
  };
  return f;
});

let style = inlined(function style(obj) {
  return properties({style: fields(obj)});
});

let elements = inlined(function elements(obj) {
  const f = function(element, state, data) {
    for (const [key, value] of Object.entries(obj)) {
      const _begin = data._begin || data.begin;
      data._begin = _begin[key];
      const _end = data._end || data.end;
      data._end = _end[key];
      value(data.animated[key].element, state[key], data);
      data._begin = _begin;
      data._end = _end;
    }
    return element;
  };
  f.store = function(store, element, data) {
    store = store || {};
    for (const [key, value] of Object.entries(obj)) {
      store[key] = value.store(store[key], data.animated[key].element, data);
    }
    return store;
  };
  f.restore = function(element, store, data) {
    for (const [key, value] of Object.entries(obj)) {
      value.restore(data.animated[key].element, store[key], data);
    }
    return element;
  };
  return f;
});

let elementArrays = inlined(function elementArrays(obj) {
  const f = function(element, state, data) {
    for (const [key, value] of Object.entries(obj)) {
      const _begin = data._begin || data.begin;
      data._begin = _begin[key];
      const _end = data._end || data.end;
      data._end = _end[key];
      const elements = data.animated[key].elements;
      const state2 = state[key];
      const _begin2 = _begin[key];
      const _end2 = _end[key];
      for (let i = 0; i < elements.length; i++) {
        data._begin = _begin2[i];
        data._end = _end2[i];
        value(elements[i], state2[i], data);
      }
      data._begin = _begin;
      data._end = _end;
    }
    return element;
  };
  f.store = function(store, element, data) {
    store = store || {};
    for (const [key, value] of Object.entries(obj)) {
      const elements = data.animated[key].elements;
      store[key] = store[key] || [];
      const store2 = store[key];
      for (let i = 0; i < elements.length; i++) {
        store2[i] = value.store(store2[i], elements[i], data);
      }
      store2.length = elements.length;
    }
    return store;
  };
  f.restore = function(element, store, data) {
    for (const [key, value] of Object.entries(obj)) {
      const elements = data.animated[key].elements;
      const store2 = store[key];
      for (let i = 0; i < elements.length; i++) {
        value.restore(elements[i], store2[i], data);
      }
    }
    return element;
  };
  return f;
});

let object = inlined(function object(obj) {
  const f = function(element, state, data) {
    for (const [key, value] of Object.entries(obj)) {
      const _begin = data._begin || data.begin;
      data._begin = _begin[key];
      const _end = data._end || data.end;
      data._end = _end[key];
      value(element, state[key], data);
      data._begin = _begin;
      data._end = _end;
    }
    return element;
  };
  f.store = function(store, element, data) {
    for (const [key, value] of Object.entries(obj)) {
      if (value.store) {
        value.store(store, element, data);
      }
    }
    return store;
  };
  f.restore = function(element, store, data) {
    for (const [key, value] of Object.entries(obj)) {
      if (value.restore) {
        value.restore(element, store, data);
      }
    }
    return element;
  };
  return f;
});

module.exports = compileRegistry({
  value,
  union,
  constant,
  key,
  suffix,
  em, percent, deg, rad, px, rem, vh, vmax, vmin, vw,
  unary,
  binary,
  abs,
  add, sub, mul, div,
  mod, min, max, eq, ne, lt, lte, gt, gte,
  begin, end, to, over,
  concat,
  func,
  translate, translatex, translatey, translatez, translate3d,
  rotate, rotatex, rotatey, rotatez, rotate3d,
  scale, scalex, scaley, scalez, scale3d,
  properties,
  fields,
  style,
  elements,
  elementArrays,
  object,
});


/***/ })
/******/ ]);