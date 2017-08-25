class PreactTransition {
  constructor({crawler, matcher, bus}) {
    this.crawler = crawler;
    this.matcher = matcher;
    this.bus = bus;

    // {
    //   node
    //   element
    //   component
    //   after
    //   before
    //   didEnter
    //   didLeave
    //   leaving
    // }
    this.nodes = {};

    // {
    //   path,
    //   component: {
    //     path,
    //     key,
    //   }
    // }
    this.elements = {};

    crawler.injectChild = this.injectChild.bind(this, crawler.injectChild.bind(crawler));

    this.stateChange = bus.bind('state:change', 3);

    this.unbindStateEnd = bus.on('state:end', this.onElementCreate.bind(this));
    this.unbindElementCreate = bus.on('element:create', this.onElementCreate.bind(this));
    this.unbindElementUpdate = bus.on('element:update', this.onElementUpdate.bind(this));
    this.unbindElementDestroy = bus.on('element:destroy', this.onElementDestroy.bind(this));
    this.unbindComponentCreate = bus.on('component:create', this.onComponentCreate.bind(this));
    this.unbindComponentUpdate = bus.on('component:update', this.onComponentUpdate.bind(this));
    this.unbindComponentDestroy = bus.on('component:destroy', this.onComponentDestroy.bind(this));
  }

  insertBeforeLink(path, link, key) {
    this.nodes[path] = this.nodes[path] || {};
    this.nodes[path][key] = {};

    if (link && this.nodes[path][link]) {
      if (this.nodes[path][link].after) {
        const after = this.nodes[path][link].after;
        this.nodes[path][after].before = key;
        this.nodes[path][key].after = after;
      }
      this.nodes[path][key].before = link;
      this.nodes[path][link].after = key;
    }
  }

  insertAfterLink(path, link, key) {
    this.nodes[path] = this.nodes[path] || {};
    this.nodes[path][key] = {};

    if (link && this.nodes[path][link]) {
      if (this.nodes[path][link].before) {
        const before = this.nodes[path][link].before;
        this.nodes[path][before].after = key;
        this.nodes[path][key].before = after;
      }
      this.nodes[path][key].after = link;
      this.nodes[path][link].before = key;
    }
  }

  removeLink(path, key) {
    if (this.nodes[path]) {
      const after = this.nodes[path][key].after;
      const before = this.nodes[path][key].before;
      if (after) {
        this.nodes[path][after].before = before;
      }
      if (before) {
        this.nodes[path][before].after = after;
      }
      delete this.nodes[path][key];
    }
  }

  onStateEnd(type, id, animation) {
    if (animation === 'leave') {
      const path = this.elements[id].path;
      this.removeLink(path, id);
      if (this.elements[id].component) {
        this.removeLink(
          this.elements[id].component.path,
          this.elements[id].component.key
        );
      }
    }
  }

  onElementCreate(type, id, element) {
    if (this.elements[id]) {
      const path = this.elements[id].path;
      this.nodes[path][id].element = element;

      if (!this.didEnter(path, id) && this.canEnter(path, id)) {
        this.nodes[path][id].didEnter = true;
        this.stateChange(type, id, 'enter');
      }
    }
  }

  onElementUpdate(type, id, element) {
    if (this.elements[id]) {
      const path = this.elements[id].path;
      this.nodes[path][id].element = element;

      if (this.nodes[path][id].didLeave && !this.nodes[path][id].leaving) {
        this.nodes[path][id].leaving = true;
        this.stateChange(type, id, 'leave');
      }
    }
  }

  onElementDestroy(type, id, element) {
    if (this.elements[id]) {
      this.removeLink(this.elements[id].path, id);
      delete this.elements[id];
    }
  }

  onComponentCreate(path, key, component) {
    this.nodes[path][key].component = component;
    if (component.base && this.match(component.base.className)) {
      this.elements[this.matchId()] = this.elements[this.matchId()] || {};
      this.elements[this.matchId()].component = {
        path,
        key,
      };
    }
  }

  onComponentUpdate(path, key, component) {
    this.nodes[path][key].component = component;
    if (this.nodes[path][key].didLeave && !this.nodes[path][key].leaving) {
      if (this.match(component.base.className)) {
        this.nodes[path][key].leaving = true;
        this.stateChange(this.matchType(), this.matchId(), 'leave');
        this.elements[this.matchId()] = this.elements[this.matchId()] || {};
        this.elements[this.matchId()].component = {
          path,
          key,
        };
      }
    }
  }

  onComponentDestroy(path, key, component) {
    this.removeLink(path, key);
  }

  nodeId(path, node) {
    if (typeof node.nodeName === 'string') {
      if (this.match(node.attributes && node.attributes.class || '')) {
        const nodeId = this.matchId();
        if (!this.elements[nodeId]) {
          this.elements[nodeId] = {
            path: path,
          };
        }
        return nodeId;
      }
    }
    else {
      return node.key;
    }
  }

  injectChild(_injectChild, node, path, index, siblings) {
    if (index <= 0) {
      this.nodes[path] = this.nodes[path] || {};

      const newOrder = inOrderUnion(
        this.nodes[path].__order || [],
        siblings.map(this.nodeId.bind(this)).filter(Boolean)
      );

      this.nodes[path].__order = this.nodes[path].__order || [];
      this.nodes[path].__order.length = 0;

      for (let i = 0; i < newOrder.length; i++) {
        const key = newOrder[i];
        this.nodes[path].push(key);
        if (this.nodes[path][key]) {
          if (i > 0) {
            this.nodes[path][key].after = newOrder[i - 1];
          }
          if (i < newOrder.length - 1) {
            this.nodes[path][key].before = newOrder[i + 1];
          }
        }
      }
    }

    if (index === -1) {
      if (this.nodes[path]) {
        let result = null;
        const keys = Object.keys(this.nodes[path]);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (!this.didLeave(path, key) && this.canLeave(path, key)) {
            if (!result) {result = [];}
            result.push(this.nodes[path][key].node);
          }
          else if (this.didLeave(path, key)) {
            if (!result) {result = [];}
            result.push(this.nodes[path][key].node);
          }
          else {
            this.removeLink(path, key);
          }
        }
        if (result) {
          for (let i = 0, l = result.length; i < l; i++) {
            result[i] = _injectChild(result[i], path);
          }
        }
        return result;
      }
      return siblings;
    }

    const nodeId = this.nodeId(path, node);
    if (!nodeId) {
      return _injectChild(node, `${path}.${node.key || index}`);
    }

    if (!this.paths[`${path}.${nodeId}`]) {
      this.paths[path][nodeId] = this.paths[`${path}.${nodeId}`] = {};
    }

    // Store untracted nodes
    if (!this.nodes[path] || !this.nodes[path][nodeId]) {
      if (index === 0) {
        this.insertBeforeLink(path, this.nodeId(path, siblings[index + 1]), nodeId);
      }
      else {
        this.insertAfterLink(path, this.nodeId(path, siblings[index - 1]), nodeId);
      }
    }
    this.nodes[path][nodeId].node = node;

    let result = node;

    // Check if a node was skipped before this given one
    // Can that node leave or is it currently?
    const lastSiblingId = this.nodeId(path, siblings[index - 1]);
    if (index > 0 && this.nodes[path][lastSiblingId].before !== nodeId) {
      if (!(result.length >= 0)) {
        result = [];
      }

      let id = this.nodes[path][lastSiblingId].before;
      for (; id && id !== nodeId; id = this.nodes[path][id].before) {
        if (!this.didLeave(path, id) && this.canLeave(path, id) || this.didLeave(path, id)) {
          this.nodes[path][id].didLeave = true;
          result.push(_injectChild(this.nodes[path][id].node, `${path}.${id}`));
        }
      }
      result.push(_injectChild(node, `${path}.${nodeId}`));
    } 
    else if (index === 0 && this.nodes[path][nodeId].after) {
      if (!(result.length >= 0)) {
        result = [];
      }

      result.unshift(_injectChild(node, `${path}.${nodeId}`));
      let id = this.nodes[path][nodeId].after;
      for (; id; id = this.nodes[path][id].after) {
        if (!this.didLeave(path, id) && this.canLeave(path, id) || this.didLeave(path, id)) {
          this.nodes[path][id].didLeave = true;
          result.unshift(_injectChild(this.nodes[path][id].node, `${path}.${id}`));
        }
      }
    }

    // If the end of the list, check if a node is missing after this given one
    // Can that node leave or is it currently?
    if (index === siblings.length - 1 && this.nodes[path][nodeId].before) {
      if (!(result.length >= 0)) {
        result = [_injectChild(node, `${path}.${nodeId}`)];
      }

      let id = this.nodes[path][nodeId].before;
      for (; id; id = this.nodes[path][id].before) {
        if (!this.didLeave(path, id) && this.canLeave(path, id) || this.didLeave(path, id)) {
          this.nodes[path][id].didLeave = true;
          result.push(_injectChild(this.nodes[path][id].node, `${path}.${id}`));
        }
      }
    }

    if (result.length) {
      return result;
    }
    return _injectChild(node, `${path}.${node.key || index}`);
  }
}
