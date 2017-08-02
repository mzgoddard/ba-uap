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
  }
  else {
    instance._cancel = noop;
  }
};

const start = (instance, {state, transition, cancel} = {}) => {
  instance.state = state;
  instance.substate = SUBSTATE.TRANSITION;
  instance._cancel = cancel;
  const result = transition();
  if (result && result.then) {
    result.then(instance._next);
  }
  else {
    instance._next();
  }
};

class State {
  constructor(initialState = '__init__') {
    this.state = initialState;
    this.substate = SUBSTATE.READY;
    this.queue = [];
    this._cancel = noop;
    this._next = () => next(this);
  }

  get() {
    return this.state;
  }

  set({state, order = ORDER.NEXT, transition = noop, cancel = noop} = {}) {
    switch (order) {
    case ORDER.QUEUE:
      if (this.substate === SUBSTATE.TRANSITION) {
        this.queue.push({state, transition, cancel});
        break;
      }
    case ORDER.NEXT:
      if (this.substate === SUBSTATE.TRANSITION) {
        for (const item of this.queue) {
          item.cancel();
        }
        this.queue.length = 0;
        this.queue.push({state, transition, cancel});
        break;
      }
    case ORDER.IMMEDIATE:
      this._cancel();
      for (const item of this.queue) {
        item.cancel();
      }
      this.queue.length = 0;
      start(this, {state, transition, cancel});
      break;
    case ORDER.ONLY_READY:
      if (this.substate === SUBSTATE.READY) {
        start(this, {state, transition, cancel});
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
