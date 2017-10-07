import {h, Component, render} from 'preact';
// import 'preact/devtools';

// import Boxart, {update, animate, present} from '../../src/preact';
import Boxart from '../../src/preact';

import animations from './index.animations';

import './index.styl';

const icons = require.context('../react-transition', false, /\.svg$/);

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
