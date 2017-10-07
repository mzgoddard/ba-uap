import {h, Component, render} from 'preact';
// import 'preact/devtools';

import Boxart, {RunLoop} from '../../src/preact';

import styles from './index.styl';

import animations from './index.animations.js';

import board from './board';

// const Page1Icon = ({icon, id, select}) => (
//   <img
//     src={icon}
//     class={`icon icon${id}`}
//     onClick={() => select([id, icon]) }/>
// );
//
// const Page1 = ({icons, shuffle, select}) => (
//   <div style={{position: 'absolute', top: 0, left: 0}}>
//     <div>
//       <button onClick={shuffle}>Shuffle</button>
//     </div>
//     <div style={{width: "750px"}}>
//       {icons.map(([key, icon]) => (
//         <Page1Icon key={key} id={key} icon={icon} select={select} />
//       ))}
//     </div>
//   </div>
// );
//
// const Page2 = ({icon, src, close}) => (
//   <div style={{position: 'absolute', top: 0, left: 0}}>
//     <button onClick={close}>Close</button>
//     <img
//       src={src}
//       class={`icon icon${icon}`}
//       style={{width: '200px', height: '200px'}} />
//   </div>
// );
//
// class Root extends Component {
//   constructor() {
//     super();
//
//     this.icons = {};
//     for (let i = 0; i < 10; i++) {
//       icons.keys().forEach(key => {
//         this.icons[`${i}` + /\w+/.exec(key)[0]] = icons(key);
//       });
//     }
//
//     this.state = {
//       icons: Object.keys(this.icons).slice(16, 64),
//       pageId: 1,
//       detailIcon: null,
//     };
//   }
//
//   render() {
//     let page;
//     if (this.state.detailIcon) {
//       page = <Page2
//         icon={this.state.detailIcon[0]}
//         src={this.state.detailIcon[1]}
//         close={() => this.setState({
//           detailIcon: null,
//           pageId: this.state.pageId + 1,
//         })}
//         />;
//     }
//     else {
//       page = <Page1
//         icons={this.state.icons.map(icon => ([icon, this.icons[icon]]))}
//         shuffle={() => {
//           const icons = Object.keys(this.icons).slice();
//           icons.sort(() => (Math.random() * 2) | 0);
//           this.setState({
//             icons: icons.slice(16, 64),
//           });
//         }}
//         select={detailIcon => this.setState({
//           detailIcon,
//           pageId: this.state.pageId + 1,
//         })}
//         />;
//     }
//     return <div>
//       {page}
//     </div>;
//   }
// }

// console.log(styles)

class Tile extends Component {
  constructor(...args) {
    super(...args);

    // console.log('Tile', this.props.value, this.props.tileKey);
    this.lastValue = this.props.value;
    this.state = {
      value: this.props.value,
    };
  }

  componentWillReceiveProps({value, removed}) {
    if (value !== this.props.value) {
      clearTimeout(this._timeoutId);
      if (!removed) {
        this._timeoutId = setTimeout(() => (
          RunLoop.main.soon().then(() => this.setState({value}))
        ), 200);
      }
    }
  }

  shouldUpdateComponent(newProps, newState) {
    return this.props.removed || newProps.removed ||
      this.state.value !== newState.value ||
      this.props.x !== newProps.x ||
      this.props.y !== newProps.y;
  }

  render({tileKey: key, x, y, removed}, {value}) {
    const newValue = this.lastValue !== value;
    this.lastValue = value;
    // newValue && console.log('newvalue', value);
    // console.log(value, this.lastValue);
    return (
      <div class={`tile tile${key} ${newValue ? 'newvalue' : ''} ${removed ? 'removed' : ''} x${x}y${y} tile-${value}`}>
        {value}
      </div>
    );
  }
}


const p0 = pos => pos.split(',')[0];
const p1 = pos => pos.split(',')[1];
const id1pos = (board, id1) => (
  Object.entries(board).find(([key, value]) => value && value.key === id1.key)[0]
);
const id1x = (board, id1) => p0(id1pos(board, id1));
const id1y = (board, id1) => p1(id1pos(board, id1));

const Board = ({board}) => (
  <div>
    {board.removedTiles.map(({key, value, id1}) => (
      <Tile key={key} tileKey={key} value={value} removed={true}
        x={id1x(board, id1)} y={id1y(board, id1)} />
    ))}
    {
      Object.entries(board)
      .filter(([key, value]) => key !== 'removedTiles')
      .filter(([key, value]) => Boolean(value))
      .map(([pos, {key, value}]) => (
        <Tile key={key} tileKey={key} value={value}
          x={p0(pos)} y={p1(pos)} />
      ))
    }
  </div>
);

class Root extends Component {
  constructor(...args) {
    super(...args);

    this.state = {
      board: board.boardNew(),
    };
  }

  componentDidMount() {
    window.addEventListener('keydown', ev => {
      // console.log(ev.which);
      // up
      if (ev.which === 38) {
        this.setState({
          board: board.boardVertical(this.state.board, 1),
        });
      }
      // left
      else if (ev.which === 37) {
        this.setState({
          board: board.boardHorizontal(this.state.board, 1),
        });
      }
      // down
      else if (ev.which === 40) {
        this.setState({
          board: board.boardVertical(this.state.board, -1),
        });
      }
      // right
      else if (ev.which === 39) {
        this.setState({
          board: board.boardHorizontal(this.state.board, -1),
        });
      }
    });
  }

  render(_, {board}) {
    return <Board board={board} />;
  }
}

render(<Boxart animations={animations}><Root /></Boxart>, document.querySelector('#root'));
// render(<Root />, document.querySelector('#root'));
