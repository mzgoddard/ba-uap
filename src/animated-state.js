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

class AnimatedState {
  constructor(animations) {
    this.state = new State();

    this.animations = animations;
    this.animation = {};

    this.loop = null;
    this.animated = null;
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

    this.updateStart = this.updateStart.bind(this);
    this._schedule = this._schedule.bind(this);
    this._unschedule = this._unschedule.bind(this);
    this.transition = this.transition.bind(this);
    this.transitionStart = this.transitionStart.bind(this);
    this.transitionEnd = this.transitionEnd.bind(this);
    this.cancel = this.cancel.bind(this);
    this.step = this.step.bind(this);
  }

  set(state, order) {
    // console.log('set', state, order);
    this.state.set({
      state, order,
      transition: this.transition,
      cancel: this.cancel,
    });

    return this;
  }

  store() {
    if (this.running && this.animated && !this.stored) {
      this.stored = true;
      this.animation.present.store(this.data.store, this.animated.root.element, this.data);
      this.animation.update(this.animated.root.element, this.data.end, this.data);
      // console.log(this.data.state.left, this.data.end.left);
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

  transition() {
    if (!this.running && this.loop) {
      this.running = this.loop.soon();
    }
    else if (!this.running) {
      this.running = new Promise(resolve => {
        this._running = resolve;
      })
      .then(() => {
        this._running = null;
      });
    }

    this.running = this.running
    .then(this.transitionStart)
    .then(this.transitionEnd);

    return this.running;
  }

  restart() {
    this.data.t = 0;
  }

  transitionStart() {
    return new Promise(resolve => {
      this._resolve = resolve;
      this.data.t = 0;
      this.setHandlers();
      this.loopAdd();
      this.store();
    });
  }

  transitionEnd() {
    this.loopRemove();
    this.restore();
  }

  cancel() {
    this.running = null;
    this._resolve();
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
