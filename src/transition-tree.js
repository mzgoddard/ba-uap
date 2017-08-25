class TransitionList {
  constructor(tree, path, idGen) {
    this.path = path;
    this.tree = tree;

    this.order = [];
    this._tmpOrder = [];
    this._tmp2Order = [];
    this._dirtyOrder = false;
    this.mustAddNodes = false;

    this.nodes = {};
    this.meta = {};

    this.isElement = idGen.isElement;
    this.nodeId = idGen.nodeId;
  }

  meta(key) {
    if (!this.meta[key]) {
      this.meta[key] = {};
    }
    return this.meta[key];
  }

  remove(key) {
    if (this.isElement(this.nodes[key])) {
      this.tree.setElementPath(key, null);
    }

    this.tree.remove(`${this.path}.${key}`);

    this.nodes[key] = null;
    this.meta[key] = null;
    this.order[this.indices[key]] = null;
    this._dirtyOrder = true;
  }

  _updateOrder() {
    if (this._dirtyOrder) {
      for (let i = this.order.length - 1; i >= 0; --i) {
        if (!this.order[i]) {
          this.order.splice(i, 1);
        }
      }

      this._dirtyOrder = false;
    }
  }

  update(src, missed) {
    this._updateOrder();

    const newOrder = this._tmpOrder;
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

    const unionResult = inOrderUnion(this.order, newOrder, this._tmp2Order, missed);
    if (unionResult === this.order) {
      this.mustAddNodes = false;
    }
    else if (unionResult === this._tmpOrder) {
      const tmp = this._tmpOrder;
      this._tmpOrder = this.order;
      this.order = tmp;
      this.mustAddNodes = false;
      return;
    }
    else if (unionResult === this._tmp2Order) {
      const tmp = this._tmp2Order;
      this._tmp2Order = this.order;
      this.order = tmp;
      this.mustAddNodes = true;
    }

    for (let i = 0; i < newOrder.length; ++i) {
      this.nodes[newOrder[i]] = src[i];
      if (typeof src[i] === 'string') {
        this.tree.setElementPath(newOrder[i], this.path);
      }
    }
  }

  missedNodes(src, dest) {
    if (!this.mustAddNodes) {
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
