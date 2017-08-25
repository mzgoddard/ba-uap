class PreactNodeIdGenerator {
  constructor(matcher) {
    this.matcher = matcher;
    this.isElement = this.isElement.bind(this);
    this.nodeId = this.nodeId.bind(this);
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

  isElement(node) {
    return typeof node.nodeName === 'string';
  }

  nodeId(node) {
    if (typeof node.nodeName === 'string') {
      if (this.match(node.attributes && node.attributes.class || '')) {
        return this.matchId();
      }
    }
    else {
      return node.key;
    }
  }
}
