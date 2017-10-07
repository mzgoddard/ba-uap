const astRegistry = require('../level0/ast-registry');

module.exports = function() {
  this.cacheable(true);
  this.addDependency(this.resource);

  return `
  const funcRegistry = require('./function-registry');
  module.exports = funcRegistry(${
    require(this.resource).funcRegistry().toString()
  });
  `;
};
