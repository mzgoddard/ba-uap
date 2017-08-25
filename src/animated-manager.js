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
    if (!this.states[id]) {
      this.states[id] = new AnimatedState(this.animations[type]);
    }
    this.states[id].set(state)
    .then(() => {
      this.loop.soon()
      .then(() => {
        this.stateEnd(type, id, state);
      });
    });
    this.stateBegin(type, id, state);
  }

  setElement(type, id, element) {
    if (this.states[id]) {
      if (this.states[id].animated) {
        this.states[id].animated.root.element.style.visibility = 'hidden';
      }
      this.states[id].schedule({root: {element}}, this.loop);
    }
  }

  remove(type, id) {
    if (this.states[id]) {
      this.states[id].unschedule();
      this.states[id] = null;
    }
  }
}
