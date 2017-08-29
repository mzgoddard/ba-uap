import BaseTransition from './base-transition';

import RunLoop from './runloop';

class PreactElementTransition extends BaseTransition {
  constructor(bus, tree, matcher, loop) {
    super(bus, tree, matcher);
    this.loop = loop || RunLoop.main;

    this.alive = {};
    this.left = {};

    this.stateChange = this.bus.bind('state:change', 3);
    this.stateDestroy = this.bus.bind('state:destroy', 2);

    this.bus.on('state:begin', this.onStateBegin.bind(this));
    this.bus.on('state:end', this.onStateEnd.bind(this));
    this.bus.on('element:create', this.onElementCreate.bind(this));
    this.bus.on('element:update', this.onElementUpdate.bind(this));
    this.bus.on('element:destroy', this.onElementDestroy.bind(this));
  }

  onStateBegin(type, id, animation) {
    if (this.alive[id]) {
      this.alive[id](true);
    }
  }

  onStateEnd(type, id, animation) {
    if (animation === 'leave' && this.tree.element(id)) {
      Promise.race([
        new Promise(resolve => {
          this.alive[id] = resolve;
        }),
        this.loop.soon()
        .then(() => this.loop.soon())
        .then(() => this.loop.soon())
        .then(() => this.loop.soon())
        .then(() => this.loop.soon())
        .then(() => false),
      ])
      .then(alive => {
        this.alive[id] = null;
        if (!alive) {
          this.tree.element(id).remove(id);
          this.stateDestroy(type, id);
        }
      });
    }
  }

  onElementCreate(type, id, element) {
    if (this.tree.element(id)) {
      const branch = this.tree.element(id);
      const path = branch.path;
      const meta = branch.meta(id);
      meta.type = type;
      meta.can = this.matcher.results[type].hasAnimation;
      if (!this.didEnter(path, id) && this.canEnter(path, id) && branch.count > 1) {
        const _className = element.className;
        element.className = `${_className} enter`;
        element.className = _className;
        this.stateChange(type, id, 'enter');
      }
      branch.meta(id).didEnter = true;
    }
  }

  onElementUpdate(type, id, element) {
    if (this.tree.element(id)) {
      const branch = this.tree.element(id);
      const meta = branch.meta(id);
      meta.can = this.matcher.results[type].hasAnimation;
      if (meta.didLeave && !meta.leaving) {
        meta._leaving = element.className;
        meta.leaving = `${element.className} leave`;
        this.left[id] = [meta.leaving, element.className];
      }
      if (meta.didLeave && meta.leaving) {
        element.className = meta.leaving;
        this.stateChange(type, id, 'leave');
      }
      if (!meta.didLeave && this.left[id]) {
        if (element.className === this.left[id][0]) {
          element.className = this.left[id][1];
        }
        this.left[id] = null;
        meta._leaving = null;
        meta.leaving = null;
      }
      if (!this.didEnter(branch.path, id) && this.canEnter(branch.path, id) && branch.count > 1) {
        const _className = element.className;
        element.className = `${_className} enter`;
        element.className = _className;
        this.stateChange(type, id, 'enter');
      }
      branch.meta(id).didEnter = true;
    }
  }

  onElementDestroy(type, id, element) {
    if (this.left[id]) {
      this.left[id] = null;
    }
    if (this.tree.element(id)) {
      this.tree.element(id).remove(id);
    }
  }
}

export default PreactElementTransition;
