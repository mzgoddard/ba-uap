const TYPE = {
  TOKEN: 'token',
  LOCAL: 'local',
  DECLARE: 'declare',
  EXPRESSION: 'expression',
  LITERAL: 'literal',
};

class Node {
  constructor(o) {
    Object.assign(this, o);
  }
}

class Token extends Node {
  toString() {
    return this.token;
  }
}

class Local extends Node {
  toString() {
    return this.name;
  }
}

class Declare extends Node {
  toString() {
    return `var ${this.local}`;
  }
}

class Expr extends Node {
  toString() {
    return this.expr.join('');
  }
}

class Binary extends Expr {
  constructor(op, left, right) {
    super({
      type: 'expression',
      expr: [token('('), left, op, right, token(')')],
    });
  }

  get op() {
    return this.expr[2];
  }

  get left() {
    return this.expr[1];
  }

  get right() {
    return this.expr[3];
  }
}

class Literal extends Node {
  toString() {
    return this.value;
  }
}

const token = str => new Token({type: TYPE.TOKEN, token: str});
const local = name => new Local({type: TYPE.LOCAL, name});
const declare = local => new Declare({type: TYPE.DECLARE, local});
const expr = ary => new Expr({type: TYPE.EXPRESSION, expr: ary});
const binary = (op, left, right) => new Binary(op, left, right);
const literal = value => new Literal({type: TYPE.LITERAL, value});

module.exports = {
  TYPE,

  Token,
  Node,
  Local,
  Declare,
  Expr,
  Binary,

  token,
  local,
  declare,
  expr,
  binary,
  literal,
};
