const BEFORE_ITEMS = 'before_items';
const AFTER_ITEMS = 'after_items';
const ITEMS = 'items';
const ANIMATE = 'animate';
const DESTROY = 'destroy';

const STAGES = [
  BEFORE_ITEMS,
  AFTER_ITEMS,
  ITEMS,
  ANIMATE,
  DESTROY,
];

export default class RunLoop {
  constructor(options = {}) {
    this.stages = {
      [BEFORE_ITEMS]: [],
      [AFTER_ITEMS]: [],
      [ITEMS]: [],
      [ANIMATE]: [],
      [DESTROY]: [],
    };
    this.stageOrder = [
      this.stages[BEFORE_ITEMS],
      this.stages[ITEMS],
      this.stages[AFTER_ITEMS],
      this.stages[ANIMATE],
      this.stages[DESTROY],
    ];
    this.cleanup = [];

    this.last = 0;
    this.loop = this.loop.bind(this);

    this.schedule(() => {
      for (let [oldItem, stage] of this.cleanup) {
        this.stages[stage].splice(
          this.stages[stage].findIndex(item => item === oldItem),
          1,
        );
      }
      this.cleanup.length = 0;
    }, BEFORE_ITEMS);

    this.requestFrame = options.requestFrame || requestAnimationFrame;
    this.cancelFrame = options.cancelFrame || cancelAnimationFrame;
    this.now = options.now || Date.now;
    this.resume();
  }

  _request() {
    this.last = this.now();
    this.rafId = this.requestFrame.call(null, this.loop);
  }

  _cancel() {
    this.cancelFrame.call(null, this.rafId);
  }

  loop() {
    this.rafId = this.requestFrame.call(null, this.loop);

    const now = this.now();
    const dt = (now - this.last) / 1000;
    this.last = now;

    for (let stage of this.stageOrder) {
      for (let item of stage) {
        try {
          (item.step || item)(dt);
        }
        catch (error) {
          console.error(error ? (error.stack || error) : error);
        }
      }
    }
  }

  pause() {
    this._cancel();
  }

  resume() {
    this._request();
  }

  add(item) {
    this.stages[ANIMATE].push(item);
  }

  remove(item) {
    this.cleanup.push([item, ANIMATE]);
  }

  once(fn, stage = BEFORE_ITEMS) {
    const _fn = (...args) => {
      this.cleanup.push([_fn, stage]);
      fn(...args);
    };
    this.stages[stage].push(_fn);
  }

  schedule(fn, stage = BEFORE_ITEMS) {
    this.stages[stage].push(fn);
  }

  unschedule(fn, stage) {
    if (!stage) {
      for (let stage of STAGES) {
        this.unschedule(fn, stage);
      }
    }
    else {
      if (this.stages[stage].find(it => it === fn)) {
        this.cleanup.push([fn, stage]);
      }
    }
  }

  soon() {
    if (!this._soon) {
      this._soon = Promise.resolve()
      .then(() => {this._soon = null;});
    }
    return this._soon;
  }
}

RunLoop.stages = {
  BEFORE_ITEMS,
  AFTER_ITEMS,
  ITEMS,
  ANIMATE,
  DESTROY,
};

if (typeof requestAnimationFrame === 'function') {
  RunLoop.main = new RunLoop();
}
else {
  RunLoop.main = new RunLoop({
    requestFrame: fn => setTimeout(fn, 16),
    cancelFrame: id => clearTimeout(id),
  });
}
