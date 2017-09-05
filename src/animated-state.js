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

const TransitionState = {
  NeedBeginning: 0,
  Beginning: 1,
  Pending: 2,
  NotRunning: 3,
  NotAnimated: 4,
  Running: 5,
};

const TransitionInput = {
  Unschedule: -1,
  Schedule: 0,
  Start: 1,
  Cancel: 3,
  Done: 4,
};

class SetObj {
  constructor() {
    this.state = '';
    this.order = '';
    this.data = null;
    this.transition = noop;
    this.cancel = noop;
  }

  set(state, order, data, transition, cancel) {
    this.state = state;
    this.order = order;
    this.data = data;
    this.transition = transition;
    this.cancel = cancel;

    return this;
  }
}

const _setObj = new SetObj();

const setObj = _setObj.set.bind(_setObj);

class AnimatedState {
  constructor(animations) {
    this.state = new State();

    this._resolve = noop;

    this.clear().use(animations);

    this.transition = this.transition.bind(this);
    this._transitionSetResolve = this._transitionSetResolve.bind(this);
    this.transitionStepSchedule = this.transitionStep.bind(this, TransitionInput.Schedule);

    this.cancel = this.cancel.bind(this);

    this.step = this.step.bind(this);
  }

  clear() {
    this.state.clear();

    this.animation = {};
    this.animations = null;
    this.animated = null;
    this.loop = null;

    this.stored = false;
    this.running = null;
    this.insideLoop = false;

    this.transitionCallback = noop;
    this.transitionState = TransitionState.NeedBeginning;

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
    this.state.set(setObj(
      state,
      order,
      _cb || noop,
      this.transition,
      this.cancel
    ));

    return this;
  }

  transition(callback) {
    this.running = new Promise(this._transitionSetResolve);
    this.transitionCallback = callback;
    this.transitionStep(TransitionInput.Start);

    return this.running;
  }

  cancel() {
    try {
      this.transitionStep(TransitionInput.Cancel);
    }
    catch (e) {
      console.error(e);
    }
  }

  _transitionSetResolve(resolve) {
    this._resolve = resolve;
  }

  transitionStep(transitionInput) {
    switch (this.transitionState) {
    case TransitionState.NeedBeginning:
      switch (transitionInput) {
      case TransitionInput.Start:
        this.transitionState = TransitionState.Beginning;
        if (this.loop) {
          this.transitionStep(TransitionInput.Schedule)
        }
        break;
      }
      break;

    case TransitionState.Beginning:
      switch (transitionInput) {
      case TransitionInput.Schedule:
        if (this.animated && this.loop) {
          this.transitionState = TransitionState.NotRunning;
          this.updateStart();
          this.transitionStep(TransitionInput.Schedule);
        }
        break;

      case TransitionInput.Cancel:
        this.transitionState = TransitionState.NeedBeginning;
        this._callCb();
        break;
      }
      break;

    case TransitionState.Pending:
      switch (transitionInput) {
      case TransitionInput.Start:
        this.transitionState = TransitionState.NotRunning;
        if (this.loop) {
          this.loop.soon().then(this.transitionStepSchedule);
        }
        break;
      }
      break;

    case TransitionState.NotRunning:
      switch (transitionInput) {
      case TransitionInput.Schedule:
        if (this.animated && this.loop) {
          if (this.transitionStart()) {
            this.transitionState = TransitionState.Running;
          }
          else {
            this.transitionState = TransitionState.Pending;
            this._callCb();
          }
        }
        break;

      case TransitionInput.Cancel:
        this.transitionState = TransitionState.Pending;
        this._callCb();
        break;
      }
      break;

    case TransitionState.NotAnimated:
      switch (transitionInput) {
      case TransitionInput.Schedule:
        if (this.animated && this.loop) {
          this.transitionState = TransitionState.Running;
          this._schedule();
        }
        break;

      case TransitionInput.Cancel:
        this.transitionState = TransitionState.Pending;
        this.transitionEnd();
        this._callCb();
        break;
      }
      break;

    case TransitionState.Running:
      switch (transitionInput) {
      case TransitionInput.Unschedule:
        this.transitionState = TransitionState.NotAnimated;
        this._unschedule();
        break;

      case TransitionInput.Cancel:
        this.transitionState = TransitionState.Pending;
        this.transitionEnd();
        this._callCb();
        break;

      case TransitionInput.Done:
        this.transitionState = TransitionState.Pending;
        this.transitionEnd();
        this._callCb();
        break;
      }
      break;
    }
  }

  updateStart() {
    this.setHandlers();
    this.animation.update(this.animated.root.element, this.data.state, this.data);
    this.data.begin = this.animation.update.copy(this.data.begin, this.data.state);
  }

  _callCb() {
    if (this.running) {
      this.running = null;
      this.transitionCallback();
      this._resolve();
    }
  }

  transitionStart() {
    this.data.begin.tsub = 0;
    this.data.t = 0;
    this.setHandlers();

    this.animation.update(this.animated.root.element, this.data.end, this.data);
    if (
      this.animation.update.should &&
      !this.animation.update.should(this.data.begin, this.data.end)
    ) {
      return false;
    }

    this.loopAdd();
    if (!this.stored) {
      this.stored = true;
      this.animation.present.store(this.data.store, this.animated.root.element, this.data);
    }
    return true;
  }

  transitionEnd() {
    this.loopRemove();
    this.restore();
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

  setHandlers() {
    const state = this.state.get() || 'default';
    const defaultAnimation = this.animations.default || noopAnimation;
    const animation = this.animations[state] || defaultAnimation;
    this.animation.update = animation.update || defaultAnimation.update || updateNoop;
    this.animation.animate = animation.animate || defaultAnimation.animate || animateNoop;
    this.animation.present = animation.present || defaultAnimation.present || presentNoop;
  }

  restart() {
    this.data.begin.tsub += this.data.t;
    this.data.t = 0;
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
      // this.running = null;
      // this._resolve();
      this.transitionStep(TransitionInput.Done);
    }
    this.animation.present(this.animated.root.element, this.data.state, this.data);
  }

  schedule(animated, loop) {
    this.animated = animated;
    this.data.animated = animated;
    if (!this.loop) {
      (loop || RunLoop.main).soon().then(this.transitionStepSchedule);
    }
    else {
      (loop || this.loop).soon().then(this.transitionStepSchedule);
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
      this.loop.soon()
      .then(() => this.transitionStep(TransitionInput.Unschedule));
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
