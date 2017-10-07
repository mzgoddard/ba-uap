import {Component} from 'preact';

// level 0
import animate from './animate';
import present from './present';
import update from './update';

// level 1
import AnimatedManager from './animated-manager';
import Bus from './bus';
import Matcher from './matcher';
import RunLoop from './runloop';

// level 2
import PreactComponentTransition from './preact-component-transition';
import PreactCrawler from './preact-crawler';
import PreactElementTransition from './preact-element-transition';
import PreactNodeIdGenerator from './preact-node-id-generator';
import PreactTransition from './preact-transition';
import TrasitionTree from './transition-tree';

/**
 * @example
 *   import Boxart from 'boxart-preact';
 *
 *   import animations from './animations';
 *
 *   render(<Boxart animations={animations}><Application /></Boxart>, rootElement);
 */

class Preact extends Component {
  constructor(...args) {
    super(...args);

    const {loop, animations} = this.props;

    const bus = new Bus();

    const animationTypes = {};
    const matcher = new Matcher();
    Object.keys(animations).forEach(key => {
      matcher.add(key, Object.keys(animations[key]));
      animationTypes[key.split(' ')[0]] = animations[key];
    });

    const manager = new AnimatedManager(animationTypes, bus, loop || RunLoop.main);

    this.crawler = new PreactCrawler(bus, matcher);

    const tree = new TrasitionTree(new PreactNodeIdGenerator(matcher));
    new PreactTransition(this.crawler, bus, tree, matcher);
    new PreactComponentTransition(bus, tree, matcher);
    new PreactElementTransition(bus, tree, matcher);
  }

  render({children}) {
    return this.crawler.inject(children[0], 'root', true);
  }
}

export default Preact;

export {
  animate,
  present,
  update,

  RunLoop,
};
