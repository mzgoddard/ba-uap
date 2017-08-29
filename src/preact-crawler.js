const {cloneElement, Component, h} = require('preact');

// Wrap vdom of stateful Component extending classes with this to trigger ref
// being called before the component first renders. This way the component will
// be hooked before that happens.
const Trickster = ({children}) => {
  return children[0];
};

class PreactCrawler {
  constructor(bus, matcher) {
    this.bus = bus;
    this.change = bus.bind('state:change', 3);
    this.create = bus.bind('element:create', 3);
    this.update = bus.bind('element:update', 3);
    this.destroy = bus.bind('element:destroy', 2);
    this.componentCreate = bus.bind('component:create', 3);
    this.componentUpdate = bus.bind('component:update', 3);
    this.componentDestroy = bus.bind('component:destroy', 2);

    this.matcher = matcher;

    this.statelessMap = new WeakMap();
    this.elementClaims = new Map();
  }

  match(str) {
    return this.matcher.match(str);
  }

  matchType() {
    return this.matcher.matchType();
  }

  matchAnimation() {
    return this.matcher.matchAnimation();
  }

  matchId() {
    return this.matcher.matchId();
  }

  children(_children, path) {
    let children = _children;
    if (!children) {return children;}
    for (let i = 0, l = children.length; i < l; i++) {
      const _node = children[i];
      const id = `${path}.${this.match(_node.attributes && _node.attributes.class || '') && this.matchId() || _node.key || i}`;
      // console.log(id);
      const node = this.inject(children[i], id);
      if (node !== children[i]) {
        if (children === _children) {
          children = _children.slice();
        }
        children[i] = node;
      }
    }
    return children;
  }

  hook(component, path, key) {
    if (component && component.render && !component.render.crawled) {
      const componentPath = `${path}.${key}`;
      const _render = component.render;
      component.render = (...args) => {
        return this.inject(_render.call(component, ...args), componentPath, true);
      };
      component.render.crawled = true;
      this.componentCreate(path, key, component);
    }
    else if (component && component.render && component.render.crawled) {
      this.componentUpdate(path, key, component);
    }
    else {
      this.componentDestroy(path, key);
    }
  }

  injectChild(node, path, index, siblings) {
    if (node) {
      return this.inject(node, `${path}.${node.key || index}`);
    }
    if (index === -1) {
      return siblings;
    }
  }

  // refComponent(ref, componentRef) {
  //
  // }
  //
  // refElement(type, id, ref) {
  //   if (ref) {
  //     return this.pool._refElement.pop(type, id, ref);
  //   }
  //   else {
  //     return this.pool._element.pop(type, id);
  //   }
  // }
  //
  // _refElement(type, id, ref, element) {
  //   ref(element);
  //   this._element(type, id, element);
  // }
  //
  // _element(type, id, element) {
  //   if (element) {
  //     if (!lastClaimed) {
  //       this.create(type, id, element);
  //     }
  //     else if (claimed) {
  //       this.update(type, id, element);
  //     }
  //   }
  //   else if (claimed) {
  //     claimed = false;
  //     this.elementClaims.delete(id);
  //     this.destroy(type, id);
  //   }
  // }

  inject(node, path, root) {
    if (!node) {return node;}

    const isComponent = typeof node.nodeName === 'function';
    if (typeof node.nodeName === 'function') {
      const _ref = node.attributes && node.attributes.ref;
      if (node.nodeName.prototype instanceof Component) {
        if (_ref) {
          return h(Trickster, null, [cloneElement(node, {
            ref: v => {
              _ref(v);
              this.hook(v, path, node.nodeName.name);
            },
          }, node.children)]);
        }
        else {
          return h(Trickster, null, [cloneElement(node, {
            ref: v => {
              this.hook(v, path, node.nodeName.name);
            },
          }, node.children)]);
        }
      }
      else {
        const _ref = node.ref || (() => {});
        const ref = component => {
          _ref(component);

          const _path = path.substring(0, path.lastIndexOf('.'));
          const _key = path.substring(path.lastIndexOf('.') + 1);
          if (component) {
            this.componentCreate(_path, _key, component);
          }
          else {
            this.componentDestroy(_path, _key);
          }
        };

        const clone = cloneElement(node, {ref}, node.children);

        const nodeName = node.nodeName;
        // let newName = this.statelessMap.get(nodeName);
        // if (!newName) {
        //   newName = (...args) => {
        //     return this.inject(nodeName(...args), `${path}.${nodeName.name}`, true);
        //   };
        //   this.statelessMap.set(nodeName, newName);
        // }
        // clone.nodeName = newName;
        clone.nodeName = (...args) => {
          return this.inject(nodeName(...args), `${path}.${nodeName.name}`, true);
        };

        return clone;
      }
    }
    else {
      const _children = node.children;
      const children = this.children(_children, path);
      if (children !== _children) {
        if (this.match(node.attributes && node.attributes.class || '')) {
          const type = this.matchType();
          const animation = this.matchAnimation();
          const id = this.matchId();

          this.change(type, id, animation);

          const _ref = node.attributes && node.attributes.ref;

          const lastClaim = this.elementClaims.get(id);
          const lastClaimed = lastClaim && lastClaim();

          let claimed = true;
          const claim = () => {claimed = false; return true;};
          this.elementClaims.set(id, claim);

          if (_ref) {
            return cloneElement(node, {
              ref: element => {
                _ref(element);
                if (element) {
                  if (!lastClaimed) {
                    this.create(type, id, element);
                  }
                  else if (claimed) {
                    this.update(type, id, element);
                  }
                }
                else if (claimed) {
                  claimed = false;
                  this.elementClaims.delete(id);
                  this.destroy(type, id);
                }
              }
            }, children);
          }
          else {
            return cloneElement(node, {
              ref: element => {
                if (element) {
                  if (!lastClaimed) {
                    this.create(type, id, element);
                  }
                  else if (claimed) {
                    this.update(type, id, element);
                  }
                }
                else if (claimed) {
                  claimed = false;
                  this.elementClaims.delete(id);
                  this.destroy(type, id);
                }
              }
            }, children);
          }
        }
        else if (children !== _children) {
          return cloneElement(node, null, children);
        }
        else {
          return node;
        }
      }
      else if (this.match(node.attributes && node.attributes.class || '')) {
        const type = this.matchType();
        const animation = this.matchAnimation();
        const id = this.matchId();

        this.change(type, id, animation);

        const _ref = node.attributes && node.attributes.ref;

        const lastClaim = this.elementClaims.get(id);
        const lastClaimed = lastClaim && lastClaim();

        let claimed = true;
        const claim = () => {claimed = false; return true;};
        this.elementClaims.set(id, claim);

        if (_ref) {
          return cloneElement(node, {
            ref: element => {
              _ref(element);
              if (element) {
                if (!lastClaimed) {
                  this.create(type, id, element);
                }
                else if (claimed) {
                  this.update(type, id, element);
                }
              }
              else if (claimed) {
                claimed = false;
                this.elementClaims.delete(id);
                this.destroy(type, id);
              }
            }
          }, _children);
        }
        else {
          return cloneElement(node, {
            ref: element => {
              if (element) {
                if (!lastClaimed) {
                  this.create(type, id, element);
                }
                else if (claimed) {
                  this.update(type, id, element);
                }
              }
              else if (claimed) {
                claimed = false;
                this.elementClaims.delete(id);
                this.destroy(type, id);
              }
            }
          }, _children);
        }
      }
      else {
        return node;
      }
    }
  }
}

module.exports = PreactCrawler;
