class PreactElementTransition extends BaseTransition {
  constructor(bus, tree, matcher) {
    super(bus, tree, matcher);

    this.stateChange = this.bus.bind('state:chage', 3);

    this.bus.on('state:end', this.onStateEnd.bind(this));
    this.bus.on('element:create', this.onElementCreate.bind(this));
    this.bus.on('element:update', this.onElementUpdate.bind(this));
    this.bus.on('element:destroy', this.onElementDestroy.bind(this));
  }

  onStateEnd(type, id, animation) {
    if (animation === 'leave' && this.tree.element(id)) {
      this.tree.element(id).remove(id);
    }
  }

  onElementCreate(type, id, element) {
    if (this.tree.element(id)) {
      const branch = this.tree.element(id);
      const path = branch.path;
      const meta = branch.meta(id);
      meta.type = type;
      meta.can = this.matcher.results[type].hasAnimation
      if (!this.didEnter(path, id) && this.canEnter(path, id)) {
        const _className = element.className;
        element.className = `${_className} enter`;
        branch.meta(id).didEnter = true;
        this.loop.soon().then(() => {
          element.className = _className;
          this.stateChange(type, id, 'enter');
        });
      }
    }
  }

  onElementUpdate(type, id, element) {
    if (this.tree.element(id)) {
      const branch = this.tree.element(id);
      const meta = branch.meta(id);
      if (meta.didLeave && !meta.leaving) {
        meta.leaving = `${element.className} leave`;
        this.stateChange(type, id, 'leave');
      }
      if (meta.leaving) {
        element.className = meta.leaving;
      }
    }
  }
}
