#!/usr/bin/env node

var path = require('path');

var webpack = require('webpack');

var config = require('./webpack.config');

var tests = require('glob').sync('{__tests__,src}/**/*.*', {
  cwd: config.context,
});

config.entry = tests
.reduce(function(carry, key) {
  carry[key] = path.resolve(config.context, key);
  return carry;
}, {});

var coverageMode = process.argv
.reduce(function(carry, opt) {return carry || /^--coverage$/.test(opt);}, false);

if (coverageMode) {
  config.babel.plugins = (config.babel.plugins || []).concat('istanbul');
}

var compiler = webpack(config);

var watchMode = process.argv
.reduce(function(carry, opt) {return carry || /^--watch/.test(opt);}, false);

if (watchMode) {
  compiler.watch({}, function() {});
}
else {
  compiler.run(function() {});
}

function hash(content) {
  return require('crypto').createHash('sha1').update(content).digest().hexSlice();
}

// Don't emit files that were already written correctly. That'll cause jest to
// run them again.
compiler.plugin('emit', function(compilation, cb) {
  Object.keys(compilation.assets).forEach(function(key) {
    try {
      var keyPath = path.resolve(config.output.path, key);
      var existing = require('fs').readFileSync(keyPath);
      if (hash(existing) === hash(compilation.assets[key].source())) {
        delete compilation.assets[key];
      }
    }
    catch (_) {}
  });
  cb();
});

var cliOnce = false;

compiler.plugin('done', function() {
  if (watchMode && cliOnce) {
    return;
  }
  // cliOnce = true;

  if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = 'test';
  }

  // require('fs').writeFileSync(
  //   path.join(config.context, 'node_modules/.cache/jest/webpack-preprocessor.js'),
  //   require('fs').readFileSync(path.join(__dirname, 'webpack-preprocessor.js'))
  // );

  try {
    require('jest-cli/build/cli').run(['--config', path.join(__dirname, 'jest.config.json')]);
  }
  catch (_) {
    require('jest/node_modules/jest-cli/build/cli').run(['--config', path.join(__dirname, 'jest.config.json')]);
  }
});
