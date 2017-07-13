/**
 * When in a production build, set the public path to load chunks and other
 * files from so that they are relative to where vendor.js is loaded from.
 *
 * @module examples/public-path
 */

import {dirname} from 'path';

if (!__webpack_require__.p) {
  let src = document.scripts[document.scripts.length - 1].src;
  src = dirname(src);
  if (!src.endsWith('/')) {
    src += '/';
  }
  __webpack_require__.p = src;
}
