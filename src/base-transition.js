class BaseTransition {
  constructor(bus, tree, matcher) {
    this.bus = bus;
    this.tree = tree;
    this.matcher = matcher;
  }

  match(className) {
    return this.matcher.match(className);
  }

  matchType() {
    return this.matcher.matchType();
  }

  matchId() {
    return this.matcher.matchId();
  }

  matchAnimation() {
    return this.matcher.matchAnimation();
  }

  can_(str, path, key) {
    const meta = this.tree.get(path).meta(key);
    if (meta.can) {
      return meta.can[str] || false;
    }
    return false;
  }

  canEnter(path, key) {
    return this.can_('enter', path, key);
  }

  canLeave(path, key) {
    return this.can_('leave', path, key);
  }

  didEnter(path, key) {
    const data = this.tree.get(path).meta(key);
    return data.didEnter;
  }

  didLeave(path, key) {
    const data = this.tree.get(path).meta(key);
    return data.didLeave;
  }
}
