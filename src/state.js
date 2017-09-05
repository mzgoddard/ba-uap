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


class StateInfo {
  constructor() {
    this.state = '';
    this.data = null;
    this.transition = noop;
    this.cancel = noop;
  }

  clear() {
    this.data = null;
    this.transition = noop;
    this.cancel = noop;
    return this;
  }

  set(state, data, transition, cancel) {
    this.state = state;
    this.data = data;
    this.transition = transition || noop;
    this.cancel = cancel || noop;
    return this;
  }
}

const infoPool = [];

StateInfo.pop = (state, data, transition, cancel) => {
  return (infoPool.pop() || new StateInfo()).set(state, data, transition, cancel);
};

StateInfo.push = info => {
  infoPool.push(info.clear());
};

const next = instance => {
  instance.substate = SUBSTATE.READY;
  const item = instance.queue.shift();
  if (item) {
    start(instance, item);
  }
  else {
    instance._cancel = noop;
  }
};

const start = (instance, info) => {
  instance.state = info.state;
  instance.substate = SUBSTATE.TRANSITION;
  instance._cancel = info.cancel;
  const result = info.transition(info.data);
  if (result && result.then) {
    result.then(instance._next);
  }
  else {
    instance._next();
  }
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

  set(info) {
    switch (info.order || ORDER.NEXT) {
    case ORDER.IMMEDIATE:
      this._cancel();

      if (this.queue.length) {
        for (let i = 0, l = this.queue.length; i < l; ++i) {
          this.queue[i].cancel();
        }
        this.queue.length = 0;
      }

      if (this.substate === SUBSTATE.READY) {
        // inline start(...)
        this.state = info.state;
        this.substate = SUBSTATE.TRANSITION;
        this._cancel = info.cancel || noop;
        const result = (info.transition || noop)(info.data);
        if (result && result.then) {
          result.then(this._next);
        }
        else {
          this._next();
        }
      }
      else {
        this._cancel = noop;
        this.queue.push(StateInfo.pop(info.state, info.data, info.transition, info.cancel));
      }
      break;

    case ORDER.NEXT:
      if (this.substate === SUBSTATE.TRANSITION) {
        for (const item of this.queue) {
          item.cancel();
        }
        this.queue.length = 0;
        this.queue.push(StateInfo.pop(info.state, info.data, info.transition, info.cancel));
        break;
      }
    case ORDER.QUEUE:
      if (this.substate === SUBSTATE.TRANSITION) {
        this.queue.push(StateInfo.pop(info.state, info.data, info.transition, info.cancel));
        break;
      }
    case ORDER.ONLY_READY:
      if (this.substate === SUBSTATE.READY) {
        start(this, StateInfo.pop(info.state, info.data, info.transition, info.cancel));
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
