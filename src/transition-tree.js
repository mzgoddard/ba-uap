import inOrderUnion from './in-order-union';

class TransitionList {
  constructor(tree, path, idGen) {
    this.path = path;
    this.tree = tree;

    this.order = [];
    this.missed = null;
    this._tmpOrder = [];
    this._tmp2Order = [];
    this._dirtyOrder = false;
    this.mustAddNodes = false;

    this.indices = [];

    this.nodes = {};
    this._meta = {};

    this.isElement = idGen.isElement;
    this.nodeId = idGen.nodeId;
  }

  meta(key) {
    if (!this._meta[key]) {
      this._meta[key] = {};
    }
    return this._meta[key];
  }

  remove(key) {
    if (!this.nodes[key]) {
      return;
    }

    if (this.isElement(this.nodes[key])) {
      this.tree.setElementPath(key, null);
    }

    this.tree.remove(`${this.path}.${key}`);

    this.nodes[key] = null;
    this._meta[key] = null;
    this._dirtyOrder = true;
  }

  _updateOrder() {
    if (this._dirtyOrder) {
      for (let i = this.order.length - 1; i >= 0; --i) {
        if (!this.nodes[this.order[i]]) {
          this.order.splice(i, 1);
        }
      }

      this._dirtyOrder = false;
    }
  }

  update(src, missed) {
    missed.length = 0;
    this.missed = missed;
    this._updateOrder();

    const newOrder = this._tmpOrder;
    if (src) {
      for (let i = 0; i < src.length; ++i) {
        const id = this.nodeId(src[i]);
        if (!id) {
          if (this.order.length > 0) {
            for (let j = 0; j < this.order.length; ++j) {
              this.remove(this.order[j]);
            }
          }
          this.mustAddNodes = false;
          return;
        }
        this._tmpOrder[i] = id;
      }
    }

    const unionResult = inOrderUnion(this.order, newOrder, this._tmp2Order, missed);
    // Same order, no new or missing nodes
    // Don't need to swap order lists
    
    // Different order or new nodes
    if (unionResult === this._tmpOrder) {
      const tmp = this._tmpOrder;
      this._tmpOrder = this.order;
      this.order = tmp;
    }
    // Missing old nodes
    else if (unionResult === this._tmp2Order) {
      const tmp = this._tmp2Order;
      this._tmp2Order = this.order;
      this.order = tmp;
    }

    for (let i = 0; i < newOrder.length; ++i) {
      this.nodes[newOrder[i]] = src[i];
      if (this.isElement(src[i])) {
        this.tree.setElementPath(newOrder[i], this.path);
      }
    }
  }

  missedNodes(src, dest) {
    for (let i = this.missed.length - 1; i >= 0; --i) {
      if (!this.nodes[this.missed[i]]) {
        this.missed.splice(i, 1);
      }
    }

    if (this.missed.length === 0) {
      return src;
    }

    this._updateOrder();

    dest.length = this.order.length;
    for (let i = 0; i < this.order.length; ++i) {
      dest[i] = this.nodes[this.order[i]];
    }

    return dest;
  }
}

class TransitionTree {
  constructor(idGen) {
    this.idGen = idGen;
    this.lists = {};
    this.elementPaths = {};
  }

  get(path) {
    if (!this.lists[path]) {
      this.lists[path] = new TransitionList(this, path, this.idGen);
    }
    return this.lists[path];
  }

  element(id) {
    return this.lists[this.elementPaths[id]];
  }

  remove(path) {
    this.lists[path] = null;
  }

  setElementPath(id, path) {
    this.elementPaths[id] = path;
  }
}

export default TransitionTree;
