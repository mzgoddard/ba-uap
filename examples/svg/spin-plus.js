import Svg from '../../src2/level3/svg-no0';

import animations from './spin-plus.animations.js';

const svg = new Svg({
  animations: animations.spinnerIllusion,
  element: document.getElementsByClassName('spinPlus')[0],
  initialState: 'default',
});
