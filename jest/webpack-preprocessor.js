// webpack-preprocessor.js
'use strict';

var path = require('path');

var root = path.join(__dirname, '..');

module.exports = {
  canInstrument: true,
  process(src, filename) {
    if (!/node_modules\/.cache\/jest/.test(filename)) {
      filename = path.relative(root, filename);
      filename = path.resolve(root, 'node_modules/.cache/jest', filename);
      src = require('fs').readFileSync(filename, 'utf8');
    }
    return src;
  },
};
