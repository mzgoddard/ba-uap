const EMPTY = 0;
const HOLDING = 1;
const BOUND = 2;
const RUNNING = 3;

const PAUSE = 0;
const RESUME = 1;
const ADD = 2;
const REMOVE = 3;

const BEFORE_ITEMS = 'BEFORE_ITEMS';
const AFTER_ITEMS = 'AFTER_ITEMS';
const ITEMS = 'ITEMS';
const ANIMATE = 'ANIMATE';
const DESTROY = 'DESTROY';

const ORDER = {
  [BEFORE_ITEMS]: 0,
  [AFTER_ITEMS]: 1,
  [ITEMS]: 2,
  [ANIMATE]: 3,
  [DESTROY]: 4,
};

const MAX_DT = 0.033;

const _remove = function(args) {
  this.remove(...args);
};

const _soonNull = function() {
  this._soon = null;
};

class RunLoop {
  constructor({
    requestFrame = window.requestAnimationFrame,
    cancelFrame = window.cancelAnimationFrame,
    now = Date.now,
  }) {
    this._state = BOUND;

    this.stages = [[], [], [], [], []];

    this.requestFrame = requestFrame;
    this.cancelFrame = cancelFrame;
    this.now = now;

    this._remove = _remove.bind(this);
    this._soonNull = _soonNull.bind(this);
    this.loop = this.loop.bind(this);
  }

  control(input) {
    const oldState = this._state;
    let state = this._state;

    if (oldState === EMPTY) {
      if (input === RESUME) {
        state = BOUND;
      }
      else if (input === ADD) {
        state = HOLDING;
      }
    }
    else if (oldState === HOLDING) {
      if (input === RESUME) {
        state = RUNNING;
      }
      else if (input === REMOVE) {
        state = EMPTY;
      }
    }
    else if (state === BOUND) {
      if (input === PAUSE) {
        state = EMPTY;
      }
      else if (input === ADD) {
        state = RUNNING;
      }
    }
    else if (state === RUNNING) {
      if (input === PAUSE) {
        state = HOLDING;
      }
      else if (input === REMOVE) {
        state = BOUND;
      }
    }

    if (state !== oldState) {
      this._state = state;

      if (oldState === RUNNING) {
        this.cancelFrame(this._frameId);
      }
      else if (state === RUNNING) {
        this._frameId = this.requestFrame(this.loop);
      }
    }
  }

  loop() {
    this._frameId = this.requestFrame(this.loop);

    const {cleanup} = this;
    let oldItem, oldData, index;
    for (let i = 0, l = cleanup.length; i < l; i += 2) {
      oldItem = cleanup[i + 0];
      oldData = cleanup[i + 1];
      for (let stage of this.stages) {
        index = stage.findIndex((item, i) => (
          i % 2 === 0 &&
          item === oldItem && stage[i + 1] === oldData
        ));
        if (index !== -1) {
          stage.splice(index, 2);
          this.itemCount -= 1;
          break;
        }
      }
    }
    cleanup.length = 0;

    if (this.itemCount === 0) {
      this.control(REMOVE);
      return;
    }

    const now = this.now();
    const dt = Math.min((now - this.last) / 1000, MAX_DT);
    this.last = now;

    for (let stage of this.stages) {
      for (let i = 0; i < stage.length; i += 2) {
        try {
          stage[i + 0](stage[i + 1], dt);
        }
        catch (error) {
          console.error(error ? (error.stack || error) : error);
        }
      }
    }
  }

  pause() {
    this.control(PAUSE);
  }

  resume() {
    this.control(RESUME);
  }

  add(fn, data = null, stage = ANIMATE) {
    if (this.itemCount === 0) {
      this.control(ADD);
    }

    this.itemCount += 1;
    this.stages[ORDER[stage]].push(fn, data);
  }

  remove(fn, data = null) {
    this.cleanup.push(fn, data);
  }

  schedule(fn, data = null, stage = BEFORE_ITEMS) {
    this.add(fn, data, stage);
  }

  unschedule(fn, data = null) {
    this.remove(fn, data);
  }

  once(fn, data = null, stage = BEFORE_ITEMS) {
    this.add(fn, data, stage);
    this.add(this._remove, [fn, data], stage);
  }

  soon() {
    if (!this._soon) {
      this._soon = Promise.resolve().then(this._soonNull);
    }
    return this._soon;
  }
}
