function node() {}

class Crawler {
  constructor( ) {
    this.tree = {};
    this.map = {};
    // Map of nodes to internal data
    // {
    //   type,
    //   id,
    //   animation,
    //   node,
    //   classnames,
    //   after,
    //   leaving: [nodes that are leaving],
    // }
    this.dataMap = new WeakMap();
  }

  setManager(manager) {}

  add() {}

  remove() {}

  crawl(node) {
    const names = this.classnames(child);
    if (this.match(names)) {
      
    }
    const type = this.type(node, names);
    if (type) {
      const id = this.id(node, names);
      const animation = this.animation(node, names);
      this.set(node, id, type, animation);
    }

    // walk children
    return this.children(node, _children => {
      let children = _children;
      let tmpI = 0;
      // iterate children
      for (let i = 0; i < children.length; i++) {
        let child = this.crawl(children[i]);
        let tmpData = this.tmpData[tmpI];
        if (child !== children[i]) {
          if (children === _children) {
            children = _children.slice();
          }
          children[i] = child;
        }
      }

      tmpI = children.length - 1;
      // preserve missed nodes if they have leave animations
      for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (this.match(this.classnames(child))) {
          const id = this.matchId();
          const data = this.dataMap.get(id);
          const after = data.after;
          if (after) {
            const dataAfter = this.dataMap.get(after);
            const last = children[i - 1];
            if (last) {
              this.match(this.classnames(last));
              const lastId = this.matchId();
              if (after !== lastId) {
                if (this.mayLeave(this.matchType())) {
                  this.set(dataAfter.node, dataAfter.type, dataAfter.id, 'leave');
                }
                if (this.isLeaving(after)) {
                  if (children === _children) {
                    children = _children.slice();
                  }
                  children.splice(i, 0, dataAfter.node);
                  i++;
                }
                else {
                  const dataA2 = this.dataMap.get(dataAfter.after);
                  if (dataA2) {
                    dataA2.before = id;
                    data.after = dataA2.id;
                  }
                  else {
                    data.after = null;
                  }
                  this.dataMap.set(dataAfter.id, null);
                }
              }
            }
          }
        }
      }
      // hard part here

      return children;
    });
  }

  setElement(node, element) {
    
  }

  classnames(node) {}

  children(node, fn) {
    // observe the node
    // call fn with an array of children
    // update the node with the returned array if its different
    // return the updated node
  }
}

class PreactCrawler {
  classnames(node) {
    return node.attributes.class || '';
  }

  children(_node, fn) {
    let children = node.children;
    if (typeof node.nodeName === 'string') {
      children = fn(children);
    }

    let node = _node;
    if (typeof node.nodeName === 'function') {
      const ref = node.ref;
      if (node.nodeName instanceof Component) {
        node = cloneElement(node, {ref: component => {
          if (ref) {ref(component);}
          const render = component.render;
          component.render = (...args) => {
            const node = render.call(component, ...args);
            this.crawl(node);
            return node;
          };
        }}, children);
      }
      else {
        node = h((...args) => {
          const vdom = node.nodeName(...args);
          this.crawl(vdom);
          return vdom;
        }, node.attributes, children);
      }
    }
    else if (children !== node.children) {
      node = cloneElement(node, null, children);
    }
    return node;
  }
}
