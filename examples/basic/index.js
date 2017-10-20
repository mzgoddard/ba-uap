import {h, Component, render} from 'preact';
// import 'preact/devtools';

import Boxart, {RunLoop} from '../../src2/level3/preact-no0';

import styles from './index.styl';

import animations from './index.animations.js';

const Box = () => <div class="box"></div>;

const Root = () => <div>
  <Box/>
</div>;

render(<Boxart animations={animations}><Root /></Boxart>, document.querySelector('#root'));
