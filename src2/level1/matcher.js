const PatternSearch = require('./pattern-search');

class Matcher {
  constructor() {
    this.patterns = new PatternSearch();
    this.results = {};
    this._match = {};
  }

  add(pattern, animationNames) {
    let [type, id] = pattern.split(' ');
    if (!id) {
      id = type;
    }
    else {
      id = id.replace('{type}', type).replace('{id}', '\\w+');
    }
    this.patterns.add(type);
    const result = {
      id: new RegExp(id + '\\w+'),
      animationNames,
      hasAnimation: {},
      animations: new PatternSearch(),
    };
    animationNames.forEach(name => {
      result.animations.add(name.replace('{type}', type));
      result.hasAnimation[name] = true;
    });
    this.results[type] = result;
  }

  match(str) {
    const name = this._match.type = this.patterns.search(str);
    const result = this.results[name];
    if (result) {
      const animationName = result.animations.search(str);
      this._match.animation = animationName;
      let idMatch = result.id.exec(str);
      if (idMatch && idMatch[0] === animationName) {
        idMatch = result.id.exec(str.substring(idMatch.index + idMatch[0].length));
      }
      if (idMatch) {
        this._match.id = idMatch[0];
      }
      else {
        this._match.id = name;
      }
    }
    else {
      this._match.animation = '';
      this._match.id = '';
    }
    return Boolean(result);
  }

  matchType() {
    return this._match.type;
  }

  matchAnimation() {
    return this._match.animation;
  }

  matchId() {
    return this._match.id;
  }

  matchHasAnimation(name) {
    return this.results[this.matchType()].hasAnimation[name] || false;
  }
}

export default Matcher;
