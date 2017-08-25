import BaseTransition from './base-transition';

class PreactTransition extends BaseTransition {
  constructor(crawler, bus, tree, matcher) {
    super(bus, tree, matcher);

    this.nextDest = [];
    this.leaving = [];

    const _children = crawler.children.bind(crawler);
    crawler.children = this.children.bind(this, _children);
  }

  children(crawlerChildren, _children, path) {
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

    const result = branch.missedNodes(_children, this.nextDest);
    if (result === this.nextDest) {
      this.nextDest = [];
    }

    return crawlerChildren(result, path);
  }
}

export default PreactTransition;
