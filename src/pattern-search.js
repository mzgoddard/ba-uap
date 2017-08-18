class PatternSearch {
  constructor() {
    this.patterns = [];
    this._dirty = true;
    this.code = [];
    this.answers = [];
  }

  add(pattern) {
    this.patterns.push({
      pattern: pattern,
      chars: pattern + '\0',
    });

    this._dirty = true;
  }

  rebuild() {
    const tree = {};
    const flat = [];
    const answers = [];

    for (let i = 0; i < this.patterns.length; i++) {
      const p = this.patterns[i];
      let node = tree;
      for (let j = 0; j < p.chars.length - 1; j++) {
        const c = p.chars[j];
        node = node[c] = node[c] || {};
      }
      node[' '] = p;
      node['\0'] = p;
    }

    let keys = Object.keys(tree);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      flat[i * 2] = key.charCodeAt(0);
      flat[i * 2 + 1] = tree[key];
    }
    flat[flat.length] = -1;
    flat[flat.length] = -1;

    let i = 0, j = flat.length;
    while (i < flat.length) {
      const node = flat[i + 1];
      if (node === -1) {
        i += 2;
        continue;
      }
      if (node.pattern) {
        flat[i + 1] = -answers.length;
        answers.push(node.pattern);
        i += 2;
        continue;
      }
      flat[i + 1] = j;
      keys = Object.keys(node);
      keys.sort();
      for (let k = 0; k < keys.length; k++) {
        const key = keys[k];
        flat[j++] = key.charCodeAt(0);
        flat[j++] = node[key];
      }
      flat[j++] = -1;
      flat[j++] = -1;
      i += 2;
    }

    this.code = new Int32Array(flat);
    this.answers = answers;

    this._dirty = false;
  }

  search(str) {
    if (this._dirty) {
      this.rebuild();
    }

    const _str = str + '\0';
    const code = this.code;
    let ptr = 0;
    for (let i = 0; i < _str.length; i++) {
      if (code[ptr] === _str.charCodeAt(i)) {
        if (code[ptr + 1] <= 0) {
          return this.answers[-code[ptr + 1]];
        }
        ptr = code[ptr + 1];
      }
      else {
        i--;
        ptr += 2;
        if (code[ptr] === -1) {
          ptr = 0;
          while (++i < _str.length && _str[i] !== ' ');
        }
      }
    }
    return false;
  }
}

// export default PatternSearch;
module.exports = PatternSearch;
