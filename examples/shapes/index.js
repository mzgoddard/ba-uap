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

const PlusSpinner = ({class: className = "plusA", fill = '#dddddd', style = {}}) => (
  <g style={style} fill={fill}>
    <g class={className}>
      <polygon points="16.67,50 16.67,16.67 50,16.67 50,-16.67 16.67,-16.67 16.67,-50 -16.67,-50 -16.67,-16.67 -50,-16.67 -50,16.67 -16.67,16.67 -16.67,50" />
    </g>
  </g>
);

const SpinnerIllusion = () => (
  <svg class="spinnerIllusion" width="100" height="100" viewBox="0 0 166 166">
    <rect class="backA" x="0" y="0" width="166" height="166" fill="#dddddd" />
    <rect class="backB" x="0" y="0" width="166" height="166" fill="#666666" />
    <PlusSpinner class="plusA" style={{transform: 'translate(50px, 50px)'}} fill="#dddddd" />
    <PlusSpinner class="plusA" style={{transform: 'translate(150px, 83.33px)'}} fill="#dddddd" />
    <PlusSpinner class="plusA" style={{transform: 'translate(183.33px, -16.67px)'}} fill="#dddddd" />
    <PlusSpinner class="plusA" style={{transform: 'translate(16.67px, 150px)'}} fill="#dddddd" />
    <PlusSpinner class="plusA" style={{transform: 'translate(116.67px, 183.33px)'}} fill="#dddddd" />
    <PlusSpinner class="plusB" style={{transform: 'translate(16.67px, -16.67px)'}} fill="#666666" />
    <PlusSpinner class="plusB" style={{transform: 'translate(116.67px, 16.67px)'}} fill="#666666" />
    <PlusSpinner class="plusB" style={{transform: 'translate(83.33px, 116.67px)'}} fill="#666666" />
    <PlusSpinner class="plusB" style={{transform: 'translate(-16.67px, 83.33px)'}} fill="#666666" />
    <PlusSpinner class="plusB" style={{transform: 'translate(183.33px, 150px)'}} fill="#666666" />
  </svg>
);

const Shapes = () => (
  <div style={{height: '100vh', transform: 'translateZ(0)'}}>
    <DotPlus />
    <SpinnerIllusion />
  </div>
);

render(<Boxart animations={animations}><Shapes /></Boxart>, document.querySelector('#root'));
// render(<Root />, document.querySelector('#root'));
