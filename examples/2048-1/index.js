import {h, Component, render} from 'preact';
// import 'preact/devtools';

import Boxart, {RunLoop} from '../../src2/level3/preact-no0';

import styles from './index.styl';

import animations from './index.animations.js';

import board from './board';

class Tile extends Component {
  constructor(...args) {
    super(...args);

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
