import BaseTransition from './base-transition';

class PreactTransition extends BaseTransition {
  constructor(crawler, bus, tree, matcher) {
    super(bus, tree, matcher);

    this.nextDest = [];
    this.current = [];
    this.leaving = [];

    const _inject = crawler.inject.bind(crawler);
    crawler.inject = this.inject.bind(this, _inject);
    const _children = crawler.children.bind(crawler);
    crawler.children = this.children.bind(this, _children);
  }

  inject(crawlerInject, _node, path, root) {
    // console.log('inject', path);
    if (root) {
      // console.log(path, _node);
      const parentPath = path.substring(0, path.lastIndexOf('.'));
      const key = path.substring(path.lastIndexOf('.') + 1);
      const id = this.tree.idGen.nodeId(_node);
      // console.log(parentPath, key, id);
      const continued = (
        this.tree.get(parentPath).nodes[id || key] &&
        this.tree.get(parentPath).nodes[key]
      );
      if (!continued) {
        console.log('remove', path);
        this.tree.remove(path);
      }
      this.tree.get(parentPath).root(key, id, _node);
      const ppPath = parentPath.substring(0, parentPath.lastIndexOf('.'));
      const pkey = parentPath.substring(parentPath.lastIndexOf('.') + 1);
      // this.tree.get(parentPath).ownMeta = this.tree.get(ppPath).meta(pkey);
      this.tree.get(parentPath)._meta[id] = this.tree.get(ppPath).meta(pkey);
      this.tree.get(parentPath)._meta[key] = this.tree.get(ppPath).meta(pkey);
      this.tree.get(parentPath).count = this.tree.get(ppPath).count;
      // this.tree.get(path).count = this.tree.get(ppPath).count;
      // console.log(parentPath, this.tree.get(parentPath).count);
      // console.log(ppPath, pkey, this.tree.get(ppPath).meta(pkey));
    }
    return crawlerInject(_node, path);
  }

  children(crawlerChildren, _children, path) {
    const branch = this.tree.get(path);
    this.current.length = 0;
    branch.update(_children, this.current, this.leaving);

    branch.count = (branch.count || 0) + 1;
    // console.log(path, branch.count);

    for (let i = 0; i < this.current.length; ++i) {
      branch.meta(this.current[i]).didLeave = false;
    }
    // console.log(JSON.stringify(this.leaving));
    for (let i = 0; i < this.leaving.length; ++i) {
      // console.log('leaving', this.leaving[i], branch.meta(this.leaving[i]).can);
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
