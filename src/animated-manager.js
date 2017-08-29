import AnimatedState from './animated-state';
import {ORDER} from './state';

class AnimatedManager {
  constructor(animations, bus, loop) {
    this.animations = animations;
    this.bus = bus;
    this.loop = loop || RunLoop.main;
    this.states = {};

    this.stateBegin = this.bus.bind('state:begin', 3);
    this.stateEnd = this.bus.bind('state:end', 3);

    this.bus.on('state:change', this.set.bind(this));
    this.bus.on('state:destroy', this.delete.bind(this));
    this.bus.on('element:*', this.setElement.bind(this));
    // this.bus.on('element:update', this.setElement.bind(this));
    this.bus.on('element:destroy', this.remove.bind(this));
  }

  set(type, id, state) {
    // console.log('set', id, state);
    if (!this.states[id]) {
      this.states[id] = new AnimatedState(this.animations[type], this.loop || RunLoop.main);
    }
    // this.states[id].unschedule();
    this.states[id].set(state || 'default', ORDER.IMMEDIATE, () => {
      this.stateEnd(type, id, state);
    })
    // .then(() => {
    //   this.stateEnd(type, id, state);
    // });
    this.stateBegin(type, id, state);
  }

  delete(type, id) {
    if (this.states[id]) {
      this.states[id].unschedule();
      this.states[id] = null;
    }
  }

  setElement(method, type, id, element) {
    if (method === 'destroy') {return;}
    if (this.states[id]) {
      // console.log('setElement', method, id, !!this.states[id].animated, this.states[id].animated && this.states[id].animated.root.element === element);
      if (this.states[id].animated && this.states[id].animated.root.element !== element) {
        // this.states[id].animated.root.element.style.visibility = 'hidden';
      }
      // else if (this.states[id].animated && this.states[id].animated.root.element === element) {
      //   return;
      // }
      // console.log('schedule');
      // new Promise(requestAnimationFrame)
      this.loop.soon()
      // .then(() => this.loop.soon())
      // .then(() => this.loop.soon())
      // .then(() => this.loop.soon())
      .then(() => {
        this.states[id].unschedule();
        this.states[id].schedule({root: {element}}, this.loop || RunLoop.main);
      });
      // this.states[id].unschedule();
      // this.states[id].schedule({root: {element}}, this.loop || RunLoop.main);
    }
  }

  remove(type, id) {
    // console.log('remove', id);
    if (this.states[id]) {
      this.states[id].unschedule();
      this.states[id] = null;
    }
  }
}

export default AnimatedManager
