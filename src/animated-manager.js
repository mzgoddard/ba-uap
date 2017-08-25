import AnimatedState from './animated-state';

class AnimatedManager {
  constructor(animations, bus, loop) {
    this.animations = animations;
    this.bus = bus;
    this.loop = loop || RunLoop.main;
    this.states = {};

    this.stateBegin = this.bus.bind('state:begin', 3);
    this.stateEnd = this.bus.bind('state:end', 3);

    this.bus.on('state:change', this.set.bind(this));
    this.bus.on('element:create', this.setElement.bind(this));
    this.bus.on('element:update', this.setElement.bind(this));
    this.bus.on('element:destroy', this.remove.bind(this));
  }

  set(type, id, state) {
    console.log(id, state, this.animations[type][state || 'default']);
    if (!this.states[id]) {
      this.states[id] = new AnimatedState(this.animations[type], this.loop || RunLoop.main);
    }
    this.states[id].set(state || 'default');
    this.states[id].running.then(() => {
      this.loop.soon()
      .then(() => {
        this.stateEnd(type, id, state);
      });
    });
    this.stateBegin(type, id, state);
  }

  setElement(type, id, element) {
    if (this.states[id]) {
      if (this.states[id].animated && this.states[id].animated.root.element !== element) {
        // this.states[id].animated.root.element.style.visibility = 'hidden';
      }
      console.log('schedule', id);
      this.states[id].unschedule();
      this.states[id].schedule({root: {element}}, this.loop || RunLoop.main);
    }
  }

  remove(type, id) {
    console.log('remove', id);
    if (this.states[id]) {
      this.states[id].unschedule();
      this.states[id] = null;
    }
  }
}

export default AnimatedManager
