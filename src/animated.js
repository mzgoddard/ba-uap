import RunLoop from './runloop'; 
import EventEmitter from 'events';

// function throttle(fn, ms) {
//   let last = 0;
//   let id = 0;
//   const call = function() {
//     const now = Date.now();
//     if (last < now - ms) {
//       id = 0;
//       last = now;
//       fn();
//     }
//     else if (!id) {
//       clearTimeout(id);
//       id = setTimeout(call, ms);
//     }
//   };
//   return call;
// }

const WindowResized = new EventEmitter();
WindowResized.setMaxListeners(200);
if (typeof window !== 'undefined') {
  // window.addEventListener('resize', throttle(event => {
  //   WindowResized.emit('resize', event);
  // }, 100));
  window.addEventListener('resize', event => {
    WindowResized.emit('resize', event);
  });
}

class AnimatedChild {
  constructor(name, element) {
    this.name = name;
    this.element = element;
  }
}

export class Animated {
  constructor(options = {}) {
    this.options = options;

    this.t = 0;
    this.state = options.state || {};
    this.begin = {};
    this.end = {};
    this.store = {};
    this.elements = {};
    this._firstRender = true;
    this._rendering = false;
    this._stored = false;

    this.update = options.update || ((element, state) => state);
    this.animate = options.animate || (() => {});
    if (!this.animate.eq) {
      this.animate.eq = () => true;
    }
    if (!this.animate.copy) {
      this.animate.copy = dest => dest;
    }
    this.present = options.present || (() => {});
    if (!this.present.store) {
      this.present.store = () => {};
      this.present.restore = () => {};
    }

    this.loop = options.loop || RunLoop.main;

    this.willRender = this.willRender.bind(this);
    this.didRender = this.didRender.bind(this);
    // this.resize = throttle(this.resize.bind(this), 100);
    this.resize = this.resize.bind(this);
    this.step = this.step.bind(this);

    this._scheduled = false;
    this.loop.once(() => this.firstRender(), RunLoop.stages.AFTER_ITEMS);

    if (options.elements) {
      for (let [name, element] of Object.entries(options.elements)) {
        this.elements[name] = new AnimatedChild(name, element);
      }
    }
  }

  destroy() {
    WindowResized.removeListener('resize', this.resize);

    if (this._scheduled) {
      this._scheduled = false;
      this.loop.remove(this);
    }
    if (this._rendering) {
      this._rendering = false;
      if (this.options.didAnimate) {
        this.options.didAnimate(this);
      }
    }
    // console.log('destroy');
    if (this._stored) {
      this._stored = false;
      this.present.restore(this.elements.root.element, this.store, this);
    }
  }

  firstRender() {
    if (this._firstRender) {
      WindowResized.on('resize', this.resize);
      this._firstRender = false;
      this.update(this.elements.root.element, this.state, this);
      this.update(this.elements.root.element, this.begin, this);
      // console.log('firstRender begin', this.begin);
      // this.didRender();
    }
  }

  continueRender(begin) {
    if (this._firstRender) {
      WindowResized.on('resize', this.resize);
      this._firstRender = false;
      // this.state = begin;
      this.state = this.animate.copy(this.state, begin);
      this.begin = this.animate.copy(this.begin, begin);
      // console.log('continueRender begin', begin);
      this.didRenderSoon();
    }
  }

  didRenderSoon() {
    this.loop.soon().then(this.didRender);
    // this.didRender();
    // new Promise(resolve => setTimeout(resolve, 50)).then(this.didRender);
    // Promise.resolve().then(this.didRender);
    // this.loop.once(this.didRender, RunLoop.stages.AFTER_ITEMS);
  }

  willRender() {
    this.lastT = this.t;
    this.t = 0;

    if (this._stored) {
      this._stored = false;
      // console.log('willRender');
      this.present.restore(this.elements.root.element, this.store, this);
    }
  }

  resize() {
    this.render(() => {
      if (this.restartOnResize) {
        this.t = 0;
      }
    });
  }

  render(fn) {
    if (!this._firstRender) {
      this.loop.once(this.willRender, RunLoop.stages.BEFORE_ITEMS);
      this.loop.once(fn, RunLoop.stages.ITEMS);
      this.loop.once(this.didRender, RunLoop.stages.AFTER_ITEMS);
    }
    else {
      this.loop.once(fn, RunLoop.stages.ITEMS);
    }
  }

  renderState() {}

  didRender() {
    // console.log('didRender');
    this.update(this.elements.root.element, this.end, this);
    this.begin = this.animate.copy(this.begin, this.state);
    // console.log('didRender', this.state, this.begin, this.end);

    if (!this._stored) {
      this._stored = true;
      this.present.store(this.store, this.elements.root.element, this);
    }

    // if (this.animate.eq && this.animate.eq(this.t, this.state, this.begin, this.end)) {
    // this.t = 0;
    // }

    this.willAnimate();
  }

  willAnimate() {
    if (this.options.willAnimate) {
      this.options.willAnimate(this);
    }

    this._rendering = true;

    if (!this._scheduled) {
      this._scheduled = true;
      this.loop.add(this);
    }
  }

  didAnimate() {
    if (this._scheduled) {
      this._scheduled = false;
      this.loop.remove(this);
    }

    this._rendering = false;

    if (this.options.didAnimate) {
      this.options.didAnimate(this);
    }

    if (this._stored) {
      this._stored = false;
      this.present.restore(this.elements.root.element, this.store, this);
    }
    // this.update(this.elements.root.element, this.state, this);
  }

  stop() {
    this.didAnimate();
  }

  step(dt) {
    if (!this._rendering) {return;}
    this.t += dt;
    this.animate(this.t, this.state, this.begin, this.end);
    // console.log(this.t);
    if (
      this.animate.eq &&
      this.animate.eq(this.t, this.state, this.begin, this.end)
    ) {
      // console.log('eq', this.t, this.animate.eq(this.t, this.state, this.begin, this.end));
      return this.didAnimate();
    }
    this.present(this.elements.root.element, this.state, this);
  }
}

export default Animated;
