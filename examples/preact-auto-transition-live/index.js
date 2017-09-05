import {h, Component, render} from 'preact';

import Boxart, {update, animate, present} from '../../src/preact';

import './index.styl';

const icons = require.context('../react-transition', false, /\.svg$/);

const animations = {
  icon: {
    'default': {
      update: update.context(({object, value, constant, property, rect}) => (
        rect(object({
          left: value(rect => rect.left + rect.width / 2),
          top: value(rect => rect.top + rect.height / 2),
          width: property('width'),
          height: property('height'),
          opacity: constant(1),
          duration: value(() => Math.random() * 0.5 + 0.5),
        }))
      )),
      animate: animate.context(({object, begin, end}) => {
        const be = begin().to(end());
        return object({ left: be, top: be, width: be, height: be, opacity: be })
        .duration(1)
        .easing((t, state, begin, end) => t / end.duration);
        // .duration(3)
      }),
      present: present.context(({styles, concat, translate, key, end, constant, scale}) => (
        styles({
          visibility: constant('initial'),
          transform: concat([
            translate([key('left'), key('top')].map(k => k.to(end).px())),
            scale([key('width'), key('height')].map(k => k.over(end))),
          ]),
          opacity: key('opacity'),
        })
      )),
    },
    enter: {
      animate: animate.context(({object, begin, end, constant}) => {
        const ce = constant(0).to(end());
        return object({ width: ce, height: ce, opacity: ce })
        .duration(1)
        .easing((t, state, begin, end) => t / end.duration);
        // .duration(3)
      }),
    },
    leave: {
      animate: animate.context(({object, begin, end, constant, value}) => {
        // const be2 = begin().to(value((t, state, begin, end) => end * 2));
        const bc = begin().to(constant(0));
        // return object({ width: be2, height: be2, opacity: bc })
        return object({ width: bc, height: bc, opacity: bc })
        .duration(1)
        .easing((t, state, begin, end) => t / end.duration);
        // .duration(3)
      }),
    },
  },
};

const Page1Icon = ({icon, id, select}) => (
  <img
    src={icon}
    class={`icon icon${id}`}
    onClick={() => select([id, icon]) }/>
);

const Page1 = ({icons, shuffle, select}) => (
  <div style={{position: 'absolute', top: 0, left: 0}}>
    <div>
      <button onClick={shuffle}>Shuffle</button>
    </div>
    <div style={{width: "750px"}}>
      {icons.map(([key, icon]) => (
        <Page1Icon key={key} id={key} icon={icon} select={select} />
      ))}
    </div>
  </div>
);

const Page2 = ({icon, src, close}) => (
  <div style={{position: 'absolute', top: 0, left: 0}}>
    <button onClick={close}>Close</button>
    <img
      src={src}
      class={`icon icon${icon}`}
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
