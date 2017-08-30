import RunLoop from './runloop';
import State from './state';

const updateNoop = (element, state) => state;
updateNoop.copy = dest => dest;
const animateNoop = () => {};
animateNoop.eq = () => true;
const presentNoop = () => {};
presentNoop.store = () => {};
presentNoop.restore = () => {};

const noopAnimation = {
  update: updateNoop,
  animate: animateNoop,
  present: presentNoop,
};

const noop = () => {};
const falseFn = () => {return false;};
const trueFn = () => {return true;}

const once = cb => {
  let first = true;
  return () => {
    if (first) {
      first = false;
      cb();
    }
  };
};

const poolSet = [];

const popSet = (state, order, data, transition, cancel) => {
  const obj = poolSet.length ? poolSet.pop() : {};
  obj.state = state;
  obj.order = order;
  obj.data = data;
  obj.transition = transition;
  obj.cancel = cancel;
  return obj;
};

const pushSet = (obj) => {
  obj.data = null;
  obj.transition = null;
  obj.cancel = null;
  poolSet.push(obj);
};

const poolData = [];

const popData = (cb) => {
  const obj = poolData.length ? poolData.pop() : {};
  obj.cb = cb;
  obj.first = true;
  return obj;
};

const pushData = (obj) => {
  obj.cb = null;
  poolData.push(obj);
};

class AnimatedState {
  constructor(animations) {
    this.state = new State();

    this.animation = {};
    this._resolve = noop;
    this._cb = noop;

    this.clear().use(animations);

    this.updateStart = this.updateStart.bind(this);
    this._schedule = this._schedule.bind(this);
    this._unschedule = this._unschedule.bind(this);
    this._callCb = this._callCb.bind(this);
    this._transitionSetResolve = this._transitionSetResolve.bind(this);
    this._transitionNotCanceled = this._transitionNotCanceled.bind(this);
    this.transition = this.transition.bind(this);
    this.transitionStart = this.transitionStart.bind(this);
    this.transitionEnd = this.transitionEnd.bind(this);
    this.cancel = this.cancel.bind(this);
    this.step = this.step.bind(this);
  }

  clear() {
    this.state.clear();

    this.animated = null;
    this.animations = null;
    this.loop = null;

    this.stored = false;
    this.running = null;
    this.insideLoop = false;

    this.data = {
      t: 0,
      animated: null,
      store: {},
      state: {},
      begin: {},
      end: {},
    };

    return this;
  }

  use(animations) {
    this.state.use();

    this.animations = animations;

    return this;
  }

  set(state, order, _cb) {
    const setObj = popSet(
      state,
      order,
      popData(_cb || noop),
      this.transition,
      this.cancel
    );
    this.state.set(setObj);
    pushSet(setObj);

    return this;
  }

  store() {
    if (this.running && this.animated && !this.stored) {
      this.stored = true;
      this.animation.present.store(this.data.store, this.animated.root.element, this.data);
      this.animation.update(this.animated.root.element, this.data.end, this.data);
    }
  }

  restore() {
    if (this.animated && this.stored) {
      this.stored = false;
      this.animation.present.restore(this.animated.root.element, this.data.store, this.data);
      this.data.begin = this.animation.update.copy(this.data.begin, this.data.state);
    }
  }

  updateStart() {
    if (this._running) {
      this._running();
    }
    this.setHandlers();
    this.animation.update(this.animated.root.element, this.data.state, this.data);
    this.data.begin = this.animation.update.copy(this.data.begin, this.data.state);
  }

  setHandlers() {
    const state = this.state.get() || 'default';
    const defaultAnimation = this.animations.default || noopAnimation;
    const animation = this.animations[state] || defaultAnimation;
    this.animation.update = animation.update || defaultAnimation.update || updateNoop;
    this.animation.animate = animation.animate || defaultAnimation.animate || animateNoop;
    this.animation.present = animation.present || defaultAnimation.present || presentNoop;
  }

  _callCb() {
    if (this.transitionData.first) {
      this.transitionData.first = false;
      this.transitionData.cb();
    }
  }

  _transitionSetResolve(resolve) {
    this._resolve = resolve;
  }

  _transitionNotCanceled(canceled) {
    if (!canceled) {
      return this.transitionStart()
      .then(this.transitionEnd);
    }
  }

  transition(data) {
    if (this.transitionData) {
      pushData(this.transitionData);
    }
    this.transitionData = data;

    if (!this.running && this.loop) {
      this.running = this.loop.soon();
    }
    else if (!this.running) {
      this.running = new Promise(resolve => {this._running = resolve;})
      .then(() => {this._running = null;});
    }

    this.running = Promise.race([
      this.running.then(falseFn),
      new Promise(this._transitionSetResolve).then(trueFn),
    ])
    .then(this._transitionNotCanceled)
    .then(this._callCb);

    return this.running;
  }

  restart() {
    this.data.begin.tsub += this.data.t;
    this.data.t = 0;
  }

  transitionStart() {
    return new Promise(resolve => {
      this._resolve = resolve;
      this.data.begin.tsub = 0;
      this.data.t = 0;
      this.setHandlers();
      this.loopAdd();
      this.store();
      if (
        this.animation.update.should &&
        !this.animation.update.should(this.data.begin, this.data.end)
      ) {
        this.cancel();
      }
    });
  }

  transitionEnd() {
    this.loopRemove();
    this.restore();
  }

  cancel() {
    try {
      this.running = null;
      this.loopRemove();
      this.restore();
      this._resolve();
      this._callCb();
    }
    catch (e) {
      console.error(e);
    }
  }

  loopAdd() {
    if (this.running && this.animated && !this.insideLoop) {
      this.insideLoop = true;
      this.loop.add(this);
    }
  }

  loopRemove() {
    if (this.insideLoop) {
      this.insideLoop = false;
      this.loop.remove(this);
    }
  }

  step(dt) {
    if (!this.animated) {return;}
    if (!this.stored) {
      return this.loop.soon()
      .then(() => this.store())
      .then(() => this.step(dt));
    }
    this.data.t += dt;
    this.animation.animate(this.data.t, this.data.state, this.data.begin, this.data.end);
    if (
      this.animation.animate.eq &&
      this.animation.animate.eq(this.data.t, this.data.state, this.data.begin, this.data.end)
    ) {
      this.running = null;
      this._resolve();
    }
    this.animation.present(this.animated.root.element, this.data.state, this.data);
  }

  schedule(animated, loop) {
    this.animated = animated;
    this.data.animated = animated;
    if (!this.loop) {
      (loop || RunLoop.main).soon()
      .then(this.updateStart)
      .then(() => (loop || RunLoop.main).soon().then(this._schedule));
    }
    else {
      (loop || this.loop).soon().then(this._schedule);
    }
    this.loop = (loop || this.loop || RunLoop.main);
    return this;
  }

  _schedule() {
    if (this.animated) {
      this.loopAdd();
      this.store();
    }
  }

  unschedule() {
    this.restore();
    this.animated = null;
    this.data.animated = null;
    if (this.loop) {
      this.loop.soon().then(this._unschedule);
    }
    return this;
  }

  _unschedule() {
    if (!this.animated) {
      this.loopRemove();
    }
  }

  destroy() {
    this.unschedule();
  }
}

export default AnimatedState;
