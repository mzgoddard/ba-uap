import Svg from '../../src2/level3/svg-no0';

import './index.styl';

import animations from './index.animations.js';

new Svg({
  animations: animations,
  element: document.getElementsByClassName('dotPlus')[0],
  initialState: 'default',
});
