import {h, Component, render} from 'preact';

import Boxart, {update, animate, present} from '../../src/preact';

import './index.styl';

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
  // update: update.eval(`rect().byElement(object({
  //   left: key('left'),
  //   top: key('top'),
  //   width: key('width'),
  //   height: key('height'),
  // }))`),
  update: update.object({
    left: update.value(element => element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2),
    top: update.value(element => element.getBoundingClientRect().top + element.getBoundingClientRect().height / 2),
    width: update.value(element => element.getBoundingClientRect().width),
    height: update.value(element => element.getBoundingClientRect().height),
    opacity: update.constant(1),
  }),
  animate: animate.object({
    left: animate.fromTo([animate.begin(), animate.end()]),
    top: animate.fromTo([animate.begin(), animate.end()]),
    width: animate.fromTo([animate.begin(), animate.end()]),
    height: animate.fromTo([animate.begin(), animate.end()]),
    opacity: animate.fromTo([animate.begin(), animate.end()]),
  }).duration(0.3),
  present: present.styles({
    visibility: present.constant(''),
    // transformOrigin: present.constant('top left'),
    transform: present.concat([
      // left - end.left
      present.translate3d([
        present.key('left')
          .sub(present.value((state, animated) => animated.end.left))
          .px(),
        present.key('top')
          .sub(present.value((state, animated) => animated.end.top))
          .px(),
        present.constant(0),
      ]),
      // width / end.width
      present.scale([
        present.div(present.key('width'), present.value((state, animated) => animated.end.width)),
        present.div(present.key('height'), present.value((state, animated) => animated.end.height)),
      ]),
    ]),
    opacity: present.key('opacity'),
  }),
}

const animations = {
  icon: {
    default: defaultAnimation,
    enter: {
      update: update.object({
        left: update.value(element => element.getBoundingClientRect().left + element.getBoundingClientRect().height / 2),
        top: update.value(element => element.getBoundingClientRect().top + element.getBoundingClientRect().width / 2),
        // width: update.constant(0),
        // height: update.constant(0),
        width: update.value(element => element.getBoundingClientRect().width),
        height: update.value(element => element.getBoundingClientRect().height),
        opacity: update.constant(1),
      }),
      animate: animate.object({
        width: animate.fromTo([animate.constant(0), animate.end()]),
        height: animate.fromTo([animate.constant(0), animate.end()]),
        opacity: animate.fromTo([animate.constant(0), animate.end()]),
      }).duration(0.3),
      present: present.styles({
        visibility: present.constant('initial'),
        // transformOrigin: present.constant('top left'),
        transform: present.concat([
          present.translate3d([
            present.sub(present.key('left'), present.value((state, animated) => animated.end.left)).px(),
            present.sub(present.key('top'), present.value((state, animated) => animated.end.top)).px(),
            present.constant(0),
          ]),
          // width / end.width
          present.scale([
            present.div(present.key('width'), present.value((state, animated) => animated.end.width)),
            present.div(present.key('height'), present.value((state, animated) => animated.end.height)),
          ]),
        ]),
        opacity: present.key('opacity'),
      }),
    },
    leave: {
      update: update.object({
        left: update.value(element => element.getBoundingClientRect().left + element.getBoundingClientRect().height / 2),
        top: update.value(element => element.getBoundingClientRect().top + element.getBoundingClientRect().width / 2),
        width: update.value(element => element.getBoundingClientRect().width),
        height: update.value(element => element.getBoundingClientRect().height),
        // width: update.value((element, state, animated) => animated.),
        // height: update.value((element, state, animated) => animated.),
        opacity: update.constant(0),
      }),
      animate: animate.object({
        width: animate.fromTo([animate.begin(), animate.constant(0)]),
        height: animate.fromTo([animate.begin(), animate.constant(0)]),
        opacity: animate.fromTo([animate.begin(), animate.constant(0)]),
      }).duration(0.3),
      present: present.styles({
        visibility: present.constant('initial'),
        // transformOrigin: present.constant('top left'),
        transform: present.concat([
          present.translate3d([
            present.sub(present.key('left'), present.value((state, animated) => animated.end.left)).px(),
            present.sub(present.key('top'), present.value((state, animated) => animated.end.top)).px(),
            present.constant(0),
          ]),
          // width / end.width
          present.scale([
            present.div(present.key('width'), present.value((state, animated) => animated.end.width)),
            present.div(present.key('height'), present.value((state, animated) => animated.end.height)),
          ]),
        ]),
        opacity: present.key('opacity'),
      }),
    },
  },
};

// <Page1Icon key={key} id={key} icon={icon} select={select} />
const Page1Icon = ({icon, id, select}) => (
  <img
    src={icon} class={`icon icon${id}`}
    onClick={() => select([id, icon]) }/>
);

const Page1 = ({icons, shuffle, select}) => (
  <div style={{position: 'absolute', top: 0, left: 0}}>
    <div>
      <button onClick={shuffle}>Shuffle</button>
    </div>
    <div style={{width: "750px"}}>
      {icons.map(([key, icon]) => (
        <img
          key={key}
          src={icon} class={`icon icon${key}`}
          onClick={() => select([key, icon]) }/>
      ))}
    </div>
  </div>
);

const Page2 = ({icon, src, close}) => (
  <div style={{position: 'absolute', top: 0, left: 0}}>
    <button onClick={close}>Close</button>
    <img src={src} class={`icon icon${icon}`}
      style={{width: '200px', height: '200px'}} />
  </div>
);

class Root extends Component {
  constructor() {
    super();

    this.icons = {};
    for (let i = 0; i < 10; i++) {
      icons.keys().forEach(key => {
        this.icons[`${i}` + /\w+/.exec(key)[0]] = icons(key);
      });
    }

    this.state = {
      icons: Object.keys(this.icons).slice(16, 64),
      pageId: 1,
      detailIcon: null,
    };
  }

  render() {
    let page;
    if (this.state.detailIcon) {
      page = <Page2
        icon={this.state.detailIcon[0]}
        src={this.state.detailIcon[1]}
        close={() => this.setState({
          detailIcon: null,
          pageId: this.state.pageId + 1,
        })}
        />;
    }
    else {
      page = <Page1
        icons={this.state.icons.map(icon => ([icon, this.icons[icon]]))}
        shuffle={() => {
          const icons = Object.keys(this.icons).slice();
          icons.sort(() => (Math.random() * 2) | 0);
          this.setState({
            icons: icons.slice(16, 64),
          });
        }}
        select={detailIcon => this.setState({
          detailIcon,
          pageId: this.state.pageId + 1,
        })}
        />;
    }
    return <div>
      {page}
    </div>;
  }
}

render(<Boxart animations={animations}><Root /></Boxart>, document.querySelector('#root'));