export const ORDER = {
  // Immediately start this new transition only if no transition is happening or
  // queued.
  ONLY_READY: 'only-ready',
  // Cancel the current state transition and immediately start the new one
  IMMEDIATE: 'immediate',
  // Remove any state in the queue and place this one at the beginning
  NEXT: 'next',
  // Place this state at the end of the queue
  QUEUE: 'queue',
};

const SUBSTATE = {
  // Ready for a new state
  READY: 'ready',
  // Transition through a state
  TRANSITION: 'transition',
};

const noop = () => {};

const next = instance => {
  instance.substate = SUBSTATE.READY;
  const item = instance.queue.shift();
  if (item) {
    start(instance, item);
    push(item);
  }
  else {
    instance._cancel = noop;
  }
};

const start = (instance, {state, data, transition, cancel} = {}) => {
  instance.state = state;
  instance.substate = SUBSTATE.TRANSITION;
  instance._cancel = cancel;
  const result = transition(data);
  if (result && result.then) {
    result.then(instance._next);
  }
  else {
    instance._next();
  }
};

const pool = [];

const pop = (state, data, transition, cancel) => {
  const obj = pool.length ? pool.pop() : {};
  obj.state = state;
  obj.data = data;
  obj.transition = transition;
  obj.cancel = cancel;
  return obj;
};

const push = (obj) => {
  pool.push(obj);
};

class State {
  constructor(initialState) {
    this.queue = [];
    this._next = () => next(this);

    this.clear();
    this.use(initialState);
  }

  clear() {
    this.state = '__init__';
    this.substate = SUBSTATE.READY;
    this.queue.length = 0;
    this._cancel = noop;
  }

  use(initialState = '__init__') {
    this.state = initialState;
  }

  get() {
    return this.state;
  }

  set({state, order = ORDER.NEXT, data = null, transition = noop, cancel = noop}) {
    switch (order) {
    case ORDER.IMMEDIATE:
      this._cancel();

      const queue = this.queue;
      for (let i = 0, l = queue.length; i < l; ++i) {
        queue[i].cancel();
      }
      queue.length = 0;

      if (this.substate === SUBSTATE.READY) {
        start(this, pop(state, data, transition, cancel));
      }
      else {
        queue.push(pop(state, data, transition, cancel));
      }
      break;

    case ORDER.NEXT:
      if (this.substate === SUBSTATE.TRANSITION) {
        for (const item of this.queue) {
          item.cancel();
        }
        this.queue.length = 0;
        this.queue.push(pop(state, data, transition, cancel));
        break;
      }
    case ORDER.QUEUE:
      if (this.substate === SUBSTATE.TRANSITION) {
        this.queue.push(pop(state, data, transition, cancel));
        break;
      }
    case ORDER.ONLY_READY:
      if (this.substate === SUBSTATE.READY) {
        start(this, pop(state, data, transition, cancel));
      }
      break;
    }
  }

  setThen({state, order, transition, cancel} = {}) {
    return new Promise((resolve, reject) => {
      this.set({
        state,
        order,
        transition: transition ?
          () => Promise.resolve(transition()).then(resolve, reject) :
          resolve,
        cancel: cancel ?
          () => {cancel(); resolve();} :
          resolve
      });
    });
  }
}

export default State;
