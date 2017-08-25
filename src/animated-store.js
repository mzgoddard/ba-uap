class AnimatedStore {
  constructor() {
    this.claims = {};
  }

  claim(key, release) {
    let state = null;
    if (this.claims[key]) {
      state = this.claims[key]();
    }
    this.claims[key] = release;
    return state;
  }

  drop(key) {
    this.claims[key] = null;
  }
}
