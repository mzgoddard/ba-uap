class Bus {
  constructor() {
    this.bound = {};
    this.sets = {};
  }

  setFor(a, b) {
    this.sets[a] = this.sets[a] || {};
    if (b === '*') {
      return this.sets[a].__all__ = this.sets[a].__all__ || new Set();
    }
    else {
      return this.sets[a][b] = this.sets[a][b] || new Set();
    }
  }

  bind(s, n) {
    if (!this.bound[s]) {
      let [a, b] = s.split(':');
      const all = this.setFor(a, '*');
      const set = this.setFor(a, b);

      if (n === 1) {
        this.bound[s] = v => {
          for (const item of all) {
            item(b, v);
          }
          for (const item of set) {
            item(v);
          }
        };
      }
      else if (n === 2) {
        this.bound[s] = (x, y) => {
          for (const item of all) {
            item(b, x, y);
          }
          for (const item of set) {
            item(x, y);
          }
        };
      }
      else if (n === 3) {
        this.bound[s] = (x, y, z) => {
          for (const item of all) {
            item(b, x, y, z);
          }
          for (const item of set) {
            item(x, y, z);
          }
        };
      }
      else if (n === 4) {
        this.bound[s] = (w, x, y, z) => {
          for (const item of all) {
            item(b, w, x, y, z);
          }
          for (const item of set) {
            item(w, x, y, z);
          }
        };
      }
      else {
        this.bound[s] = (...args) => {
          for (const item of all) {
            item(b, ...args);
          }
          for (const item of set) {
            item(...args);
          }
        };
      }
    }

    return this.bound[s];
  }

  on(s, fn) {
    let [a, b] = s.split(':');
    const set = this.setFor(a, b);

    set.add(fn);
    return () => set.delete(fn);
  }
}

export default Bus;
