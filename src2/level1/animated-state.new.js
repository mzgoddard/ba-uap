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

const TSTATES = 9;

const EMPTY = 0;
const INITIALIZED = 1;
const BOUND = 2;
const STARTING = 3;
const PREPPED = 4;
const PENDING = 5;
const READY = 6;
const WAIT_FOR_FRAME = 7;
const RUNNING = 8;

const TINPUTS = 5;

const PREPARE = 0;
const SCHEDULE = 1;
const UNSCHEDULE = 2;
const START = 3;
const DONE = 4;

const __INIT__ = '__init__';

class AnimatedState {
  constructor(animations) {
    this.state = __INIT__;
    this.transitionState = EMPTY;
    this.animation = null;
    this.animations = animations;
    this.data = {
      t: 0,
      lastT: 0,
      store: null,
      state: null,
      begin: null,
      end: null,
      animated: null,
    };

    this.resolve = noop;

    this.step = this.step.bind(this);
  }

  get() {
    return this.state;
  }

  set(state, order, resolve = noop) {
    this.state = state;
    this.transitionStep(PREPARE);
    // Set resolve after stepping the transitionState. Stepping may call the
    // last set resolve method to signal to another object that its state
    // transition completed in some fashion.
    this.resolve = resolve;
  }

  setThen(state) {
    return new Promise(resolve => this.set(state, null, resolve));
  }

  schedule(animated, loop) {
    this.data.animated = animated;
    this.loop = loop;
    this.transitionStep(SCHEDULE);
  }

  unschedule() {
    this.transitionStep(UNSCHEDULE);
    this.data.animated = null;
  }

  startSoon(state = WAIT_FOR_FRAME) {
    this.animation = {};
    this.loop.soon().then(() => this.transitionStep(START));
    this.transitionState = state;
  }

  transitionStep(input) {
    switch (this.transitionState) {
    case STARTING:
    case WAIT_FOR_FRAME:
      switch (input) {
      case START:
        const state = this.get() || 'default';
        const defaultAnimation = this.animations.default || noopAnimation;
        const animation = this.animations[state] || defaultAnimation;
        this.animation.update = animation.update ||
          defaultAnimation.update || updateNoop;
        this.animation.animate = animation.animate ||
          defaultAnimation.animate || animateNoop;
        this.animation.present = animation.present ||
          defaultAnimation.present || presentNoop;

        const {data} = this;
        const {root} = data.animated;
        const {update, present} = this.animation;
        data.lastT = data.t;
        data.t = 0;
        data.end = update(root.element, data.end, data);
        if (this.transitionState === STARTING) {
          data.state = update.copy(data.state, data.end);
          data.begin = update.copy(data.begin, data.end);
        }
        data.store = present.store(data.store, root.element, data);
        this.loop.add(this);
        this.transitionState = RUNNING;
        return;
      }
      break;
    }

    switch (this.transitionState) {
    case EMPTY:
      switch (input) {
      case PREPARE:
        this.transitionState = INITIALIZED;
        break;
      case SCHEDULE:
        this.transitionState = BOUND;
        break;
      }
      break;

    case INITIALIZED:
      switch (input) {
      case SCHEDULE:
        this.startSoon(STARTING);
        break;
      }
      break;

    case BOUND:
      switch (input) {
      case PREPARE:
        this.startSoon(STARTING);
        break;
      case UNSCHEDULE:
        this.transitionState = EMPTY;
        break;
      }
      break;

    case PREPPED:
      switch (input) {
      case PREPARE:
        this.transitionState = PENDING;
        break;
      case SCHEDULE:
        this.transitionState = READY;
        break;
      }
      break;

    case PENDING:
      switch (input) {
      case PREPARE:
        this.resolve();
        break;
      case SCHEDULE:
        this.startSoon();
        break;
      }
      break;

    case READY:
      switch (input) {
      case PREPARE:
        this.startSoon();
        break;
      case UNSCHEDULE:
        this.transitionState = PREPPED;
        break;
      }
      break;

    case WAIT_FOR_FRAME:
      switch (input) {
      case PREPARE:
        this.resolve();
        break;
      case UNSCHEDULE:
        this.transitionState = PENDING;
        break;
      }
      break;

    case RUNNING:
      switch (input) {
      case PREPARE:
      case DONE:
        this.resolve();
      case UNSCHEDULE:
        this.animation.present.restore(this.data.animated.root.element, this.data.store, this.data);
        this.animation.update.copy(this.data.begin, this.data.state);
        this.loop.remove(this);
        break;
      }

      switch (input) {
      case PREPARE:
        this.startSoon();
        break;
      case UNSCHEDULE:
        this.transitionState = PENDING;
        break;
      case DONE:
        this.transitionState = READY;
        break;
      }
    }
  }

  step(dt) {
    if (this.transitionState !== RUNNING) {return;}
    const {data} = this;
    const {animate, present} = this.animation;
    data.t += dt;
    animate(data.t, data.state, data.begin, data.end);
    if (animate.eq && animate.eq(data.t, data.state, data.begin, data.end)) {
      this.transitionStep(DONE);
    }
    else {
      present(data.animated.root.element, data.state, data);
    }
  }
}

export default AnimatedState;
