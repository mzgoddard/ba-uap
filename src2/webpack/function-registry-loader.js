const astRegistry = require('../level0/ast-registry');

module.exports = function() {
  this.cacheable(true);
  this.addDependency(this.resource);

  if (this.compileBoxartFunction) {
    const done = this.async();
    this.compileBoxartFunction(this.resource, function(error, astRegistry) {
      if (error) {
        done(error);
        return;
      }
      done(
        null,
        `
        const funcRegistry = require('./function-registry');
        module.exports = funcRegistry(${
          astRegistry.funcRegistry().toString()
        });
        `
      );
    });
    return;
  }

  return `
  const funcRegistry = require('./function-registry');
  module.exports = funcRegistry(${
    require(this.resource).funcRegistry().toString()
  });
  `;
};
