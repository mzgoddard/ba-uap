import {h, Component, render} from 'preact';
// import 'preact/devtools';

import Boxart, {RunLoop} from '../../src2/level3/preact-no0';

import styles from './index.styl';

import animations from './index.animations.js';

const DotPlus = () => (
  <div style={{width: '100px', height: '100px', transform: 'translateZ(0)'}}>
    <svg class="dotPlus" viewBox="0 0 100 100">
      <g transform="translate(50 50)">
        <circle class="dot" r="10" />
      </g>
      <g transform="translate(50 50)">
        <rect class="pipe" x="-5" y="-40" width="10" height="80" rx="5" ry="5" />
      </g>
      <g transform="translate(50 50)">
        <rect class="right" x="0" y="-5" width="40" height="10" rx="5" ry="5" />
      </g>
      <g transform="translate(50 50)">
        <rect class="left" x="-40" y="-5" width="40" height="10" rx="5" ry="5" />
      </g>
    </svg>
  </div>
);

const Shapes = () => (
  <div style={{height: '100vh', transform: 'translateZ(0)'}}>
    <DotPlus />
  </div>
);

render(<Boxart animations={animations}><Shapes /></Boxart>, document.querySelector('#root'));
// render(<Root />, document.querySelector('#root'));
