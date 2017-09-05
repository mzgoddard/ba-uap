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
        if (c !== '*') {
          node = node[c] = node[c] || {};
        }
        else {
          const wildNode = {};
          const wildStack = [[node, Object.keys(node), 0]];
          while (wildStack.length) {
            const memory = wildStack.pop();
            node = memory[0];
            const keys = memory[1];
            const i = memory[2];
            if (i < keys.length) {
              const child = node[keys[i]];
              wildStack.push([node, keys, i + 1]);
              if (!child.pattern) {
                wildStack.push([child, Object.keys(child), 0]);
              }
            }
            else {
              node = node['*'] = wildNode;
            }
          }
        }
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
      keys.sort((a, b) => (
        a === '*' ? 1 :
        b === '*' ? -1 :
          a.charCodeAt(0) - b.charCodeAt(0)
      ));
      for (let k = 0; k < keys.length; k++) {
        const key = keys[k];
        if (key === '*') {
          flat[j++] = -2;
          flat[j++] = node[key];
        }
        else {
          flat[j++] = key.charCodeAt(0);
          flat[j++] = node[key];
        }
      }
      flat[j++] = -1;
      flat[j++] = -1;
      i += 2;
    }

    this.code = new Int32Array(flat);
    this.answers = answers;

    this._dirty = false;
  }

  search(str, begin, end) {
    if (this._dirty) {
      if (this.patterns.length === 0) {
        return false;
      }
      this.rebuild();
    }

    this.begin = begin;
    const _str = str + '\0';
    const code = this.code;
    let ptr = 0;
    for (let i = begin || 0, l = end || _str.length; i < l; ++i) {
      if (code[ptr] === _str.charCodeAt(i)) {
        if (code[ptr + 1] <= 0) {
          this.end = i;
          return this.answers[-code[ptr + 1]];
        }
        ptr = code[ptr + 1];
      }
      else if (code[ptr] === -2 && _str[i] !== ' ' && _str[i] !== '\0') {
        ptr = code[ptr + 1];
        while (i < l && _str[i] !== ' ' && _str[i] !== '\0') {++i;}
        --i;
      }
      else {
        --i;
        ptr += 2;
        if (code[ptr] === -1) {
          ptr = 0;
          while (++i < l && _str[i] !== ' ');
          this.begin = i;
        }
      }
    }
    return false;
  }
}

// export default PatternSearch;
module.exports = PatternSearch;
