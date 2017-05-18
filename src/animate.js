import builder from './function-registry';

const animate = builder(() => {
  const value = fn => {
    const f = (t, state, begin, end) => fn(t, state, begin, end);
    f.a = (a, t, state, begin, end) => fn(t, state, begin, end);
    f.eq = (t, state, begin, end) => fn(t, state, begin, end) == fn(1, state, begin, end);
    f.clone = state => state;
    f.copy = (dest, src) => src;
    return f;
  };

  const at = pos => {
    const f = (t, state, begin, end) => {
      return (end - begin) * pos + begin;
    };
    f.a = (a, t, state, begin, end) => {
      const b = f(t, state, begin, end);
      const e = a(t, state, begin, end);
      return (e - b) * Math.min(1, t) + b;
    };
    f.eq = (t, state, begin, end) => (
      begin >= end ? state <= end : state >= end
    );
    f.clone = state => state;
    f.copy = (dest, src) => src;
    return f;
  }

  const begin = () => at(0);
  const end = () => at(1);

  // assert.equal(at(0)(0, 0, 0, 1), 0);
  // assert.equal(at(0.5)(0, 0, 0, 1), 0.5);
  // assert.equal(at(1)(0, 0, 0, 1), 1);
  // assert.equal(at(0).a(at(1), 0, 0, 0, 1), 0);
  // assert.equal(at(0).a(at(1), 0.5, 0, 0, 1), 0.5);
  // assert.equal(at(0).a(at(1), 1, 0, 0, 1), 1);
  // assert.equal(at(0).a(at(0.5), 1, 0, 0, 1), 0.5);
  // assert.equal(at(0.5).a(at(1), 0, 0, 0, 1), 0.5);
  // assert.equal(at(1).a(at(0), 0, 0, 0, 1), 1);
  // assert.equal(at(1).a(at(0), 1, 0, 0, 1), 0);

  const fromTo = ([a, b]) => {
    const f = (t, state, begin, end) => a.a(b, t, state, begin, end);
    f.eq = (...args) => b.eq(...args);
    f.clone = state => a.clone(state);
    f.copy = (dest, src) => a.copy(dest, src);
    return f;
  };

  const to = (a, b) => fromTo([a, b]);

  // assert.equal(fromTo([at(0), at(1)])(0, 0, 0, 1), 0);
  // assert.equal(fromTo([at(0), at(1)])(0.5, 0, 0, 1), 0.5);
  // assert.equal(fromTo([at(0), at(1)])(1, 0, 0, 1), 1);
  // assert.equal(fromTo([at(0), at(0.5)])(1, 0, 0, 1), 0.5);
  // assert.equal(fromTo([at(0.5), at(1)])(0, 0, 0, 1), 0.5);
  // assert.equal(fromTo([at(1), at(0)])(0, 0, 0, 1), 1);

  const object = o => {
    const entries = Object.entries(o);
    const f = (t, state, begin, end) => {
      for (let [key, value] of entries) {
        state[key] = value(t, state[key], begin[key], end[key]);
      }
      return state;
    };
    f.a = (a, t, state, begin, end) => {
      for (let [key, value] of entries) {
        state[key] = value.a(a.o[key], t, state[key], begin[key], end[key]);
      }
      return state;
    };
    f.eq = (t, state, begin, end) => {
      for (let [key, value] of entries) {
        if (!value.eq(t, state[key], begin[key], end[key])) {
          return false;
        }
      }
      return true;
    };
    f.clone = state => {
      const obj = {};
      for (let [key, value] of entries) {
        obj[key] = value.clone(state[key]);
      }
      return obj;
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
  }

  // assert.equal(object({a: fromTo([at(0), at(1)])})(0, {a: 0}, {a: 0}, {a: 1}).a, 0);
  // assert.equal(object({a: fromTo([at(0), at(1)])})(0.5, {a: 0}, {a: 0}, {a: 1}).a, 0.5);
  // assert.equal(object({a: fromTo([at(0), at(1)])})(1, {a: 0}, {a: 0}, {a: 1}).a, 1);
  // assert.equal(fromTo([object({a: at(0)}), object({a: at(1)})])(0, {a: 0}, {a: 0}, {a: 1}).a, 0);
  // assert.equal(fromTo([object({a: at(0)}), object({a: at(1)})])(0.5, {a: 0}, {a: 0}, {a: 1}).a, 0.5);
  // assert.equal(fromTo([object({a: at(0)}), object({a: at(1)})])(1, {a: 0}, {a: 0}, {a: 1}).a, 1);

  const easing = (fn, tfn) => {
    const f = (t, state, begin, end) => {
      return fn(tfn(t), state, begin, end);
    };
    f.eq = (t, state, begin, end) => fn.eq(t, state, begin, end);
    f.clone = state => fn.clone(state);
    f.copy = (dest, src) => fn.copy(dest, src);
    return f;
  };

  const duration = (seconds, fn) => {
    const f = (t, state, begin, end) => {
      return fn(Math.min(1, t / seconds), state, begin, end);
    };
    f.eq = (t, state, begin, end) => fn.eq(t, state, begin, end);
    // f.eq = t => t / seconds >= 1;
    f.clone = state => fn.clone(state);
    f.copy = (dest, src) => fn.copy(dest, src);
    return f;
  };

  return {
    at,
    begin,
    duration,
    easing,
    end,
    fromTo,
    object,
    to,
    value,
  };
}).freeze();

export const at = animate.at;
export const begin = animate.begin;
export const duration = animate.duration;
export const easing = animate.easing;
export const end = animate.end;
export const fromTo = animate.fromTo;
export const object = animate.object;
export const to = animate.to;
export const value = animate.value;

export default animate;
