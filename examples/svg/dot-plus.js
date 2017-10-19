import Svg from '../../src2/level3/svg-no0';

import animations from './dot-plus.animations.js';

const svg = new Svg({
  animations: animations.dotPlus,
  element: document.getElementsByClassName('dotPlus')[0],
  initialState: 'default',
});
