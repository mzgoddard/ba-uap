import {h, Component, render} from 'preact';
import TransitionGroup from 'preact-transition-group';

import Transition from './transition';

import {update, animate, present} from '../../src';

const icons = require.context('../react-transition', false, /\.svg$/);

const pageDefaultAnimation = {
  update: update.object({
    opacity: update.constant(1),
  }),
  present: present.styles({
    opacity: present.key('opacity'),
  }),
};

const fadeInAnimation = {
  update: update.object({
    opacity: update.constant(0),
  }),
  animate: animate.object({
    opacity: animate.fromTo([animate.constant(0), animate.constant(1)]),
  }).duration(0.3),
  present: present.styles({
    opacity: present.key('opacity'),
  }),
};

const fadeOutAnimation = {
  update: update.object({
    opacity: update.constant(0),
  }),
  animate: animate.object({
    opacity: animate.fromTo([animate.constant(1), animate.constant(0)]),
  }).duration(0.7),
  present: present.styles({
    opacity: present.key('opacity'),
  }),
};

const defaultAnimation = {
  // update: update.rect().byElement(update.properties({
  //   left: update.identity(),
  //   top: update.identity(),
  // })),
  update: update.object({
    left: update.value(element => element.getBoundingClientRect().left),
    top: update.value(element => element.getBoundingClientRect().top),
  }),
  animate: animate.object({
    left: animate.fromTo([animate.begin(), animate.end()]),
    top: animate.fromTo([animate.begin(), animate.end()]),
  }).duration(0.3),
  present: present.styles({
    transform: present.translate([
      present.sub(present.key('left'), present.value((state, animated) => animated.end.left)).px(),
      present.sub(present.key('top'), present.value((state, animated) => animated.end.top)).px(),
    ]),
  }),
}

const Page1 = ({icons, shuffle, select}) => (
  <div style={{position: 'absolute', top: 0, left: 0}}>
    <div>
      <button onClick={shuffle}>Shuffle</button>
    </div>
    <div style={{width: "250px"}}>
      {icons.map(([key, icon]) => (
        <Transition key={key} animatedKey={key} animations={{
          // enter: defaultAnimation,
          default: defaultAnimation,
        }} >
          <img src={icon} style={{width: "50px", height: "50px"}} onClick={() => select([key, icon]) }/>
        </Transition>
      ))}
    </div>
  </div>
);

const Page2 = ({icon, src, close}) => (
  <div style={{position: 'absolute', top: 0, left: 0}}>
    <button onClick={close}>Close</button>
    <Transition animatedKey={icon} animations={{
      default: defaultAnimation,
    }}>
      <img src={src} style={{width: '50px', height: '50px'}} />
    </Transition>
  </div>
);

class ShallowTransition extends Transition {
  shouldComponentUpdate(newProps) {
    for (const key in newProps) {
      if (newProps[key] !== this.props[key]) {
        return true;
      }
    }
    for (const key in this.props) {
      if (newProps[key] !== this.props[key]) {
        return true;
      }
    }
    return false;
  }
}

class Root extends Component {
  constructor() {
    super();

    this.icons = {};
    icons.keys().forEach(key => {
      this.icons[/\w+/.exec(key)[0]] = icons(key);
    });

    this.state = {
      icons: Object.keys(this.icons).slice(0, 10),
      pageId: 1,
      detailIcon: null,
    };
  }

  render() {
    console.log(this.state.pageId);
    let page;
    if (this.state.detailIcon) {
      page = <Transition key={`page${this.state.pageId}`} animatedKey="page2" animations={{}}>
        <Page2
          icon={this.state.detailIcon[0]}
          src={this.state.detailIcon[1]}
          close={() => this.setState({
            detailIcon: null,
            pageId: this.state.pageId + 1,
          })}
          />
      </Transition>;
    }
    else {
      page = <Transition key={`page${this.state.pageId}`} animatedKey="page1" animations={{
        appear: fadeInAnimation,
        // enter: fadeInAnimation,
        // leave: fadeOutAnimation,
        default: pageDefaultAnimation,
      }}>
        <Page1
          icons={this.state.icons.map(icon => ([icon, this.icons[icon]]))}
          shuffle={() => {
            const icons = this.state.icons.slice();
            icons.sort(() => (Math.random() * 2) | 0);
            this.setState({
              icons,
            });
          }}
          select={detailIcon => this.setState({
            detailIcon,
            pageId: this.state.pageId + 1,
          })}
          />
      </Transition>;
    }
    return <div>
      <Transition animatedKey="top">
        <TransitionGroup>
          {page}
        </TransitionGroup>
      </Transition>
    </div>;
  }
}

render(<Root />, document.querySelector('#root'));
