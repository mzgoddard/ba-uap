import {ORDER} from './state';

class Transition {
  constructor(state, animated) {
    this.state = state;
    this.animated = animated;
    this.state.schedule(animated);
  }

  destroy() {
    this.animated = null;
    this.state.unschedule();
  }

  set(name, order) {
    if (this.state.running) {
      // this.state.restore();
    }
    // return Promise.resolve()
    // .then(() => {
      this.state.set(name, order);
      console.log('transition running', this.state.state.get(), !!this.state.running);
      return this.state.running;
    // });
  }

  appear() {
    if (!this.animated) {
      return;
    }
    if (this.state.state.get() !== '__init__') {
      return this.update();
    }
    if (this.state.animations.appear) {
      return this.set('appear', ORDER.IMMEDIATE);
    }
  }

  enter() {
    console.log('inner transition enter', this.debugId, !!this.state.animations.enter, this.state.state.get());
    if (!this.animated) {
      return;
    }
    if (
      this.state.state.get() !== '__init__' &&
      this.state.state.get() === 'enter'
    ) {
      console.log('inner transition will not enter', this.debugId);
      return this.update();
    }
    if (this.state.animations.enter) {
      console.log('inner transition will enter', this.debugId);
      return this.set('enter', ORDER.IMMEDIATE)
      .then(() => console.log('inner transition did enter', this.debugId));
    }
    else {
      return this.update();
    }
  }

  leave() {
    if (!this.animated) {
      return;
    }
    if (this.state.animations.leave) {
      return this.set('leave', ORDER.IMMEDIATE);
    }
  }

  update() {
    if (!this.animated) {
      return;
    }
    // if (this.state.state.get() === 'leave') {
    //   return this.enter();
    // }
    this.state.set('default', ORDER.ONLY_READY);
    return this.state.running;
  }
}

export default Transition;
