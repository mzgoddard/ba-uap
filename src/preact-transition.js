class PreactTransition extends BaseTransition {
  constructor(crawler, bus, tree, matcher) {
    super(bus, tree, matcher);

    this.nextDest = [];
    this.leaving = [];

    const _children = crawler.children.bind(crawler);
    crawler.children = this.children.bind(this, _children);
  }

  children(_super, _children, path) {}
    const branch = this.tree.get(path);
    branch.update(_children, this.leaving);

    for (let i = 0; i < this.leaving.length; ++i) {
      if (branch.meta(this.leaving[i]).didLeave) {
        continue;
      }
      else if (this.canLeave(path, this.leaving[i])) {
        branch.meta(this.leaving[i]).didLeave = true;
      }
      else {
        branch.remove(this.leaving[i]);
      }
    }
    this.leaving.length = 0;

    const result = branch.missedNodes(_children, this.nextDest);
    if (result === this.nextDest) {
      this.nextDest = [];
    }

    return _super(result, path);
  }
}