const boardNew = () => {
  const board = {
    removedTiles: [],
  };
  boardSet(board, 0, 0, 0);
  boardSet(board, 1, 0, 0);
  boardSet(board, 2, 0, 0);
  boardSet(board, 3, 0, 0);
  boardSet(board, 0, 1, 0);
  boardSet(board, 1, 1, 0);
  boardSet(board, 2, 1, 0);
  boardSet(board, 3, 1, 0);
  boardSet(board, 0, 2, 0);
  boardSet(board, 1, 2, 0);
  boardSet(board, 2, 2, 0);
  boardSet(board, 3, 2, 0);
  boardSet(board, 0, 3, 0);
  boardSet(board, 1, 3, 0);
  boardSet(board, 2, 3, 0);
  boardSet(board, 3, 3, 0);
  return board;
};

const boardCopy = board => {
  const copy = {
    removedTiles: [],
  };
  boardSet(copy, 0, 0, boardGet(board, 0, 0));
  boardSet(copy, 1, 0, boardGet(board, 1, 0));
  boardSet(copy, 2, 0, boardGet(board, 2, 0));
  boardSet(copy, 3, 0, boardGet(board, 3, 0));
  boardSet(copy, 0, 1, boardGet(board, 0, 1));
  boardSet(copy, 1, 1, boardGet(board, 1, 1));
  boardSet(copy, 2, 1, boardGet(board, 2, 1));
  boardSet(copy, 3, 1, boardGet(board, 3, 1));
  boardSet(copy, 0, 2, boardGet(board, 0, 2));
  boardSet(copy, 1, 2, boardGet(board, 1, 2));
  boardSet(copy, 2, 2, boardGet(board, 2, 2));
  boardSet(copy, 3, 2, boardGet(board, 3, 2));
  boardSet(copy, 0, 3, boardGet(board, 0, 3));
  boardSet(copy, 1, 3, boardGet(board, 1, 3));
  boardSet(copy, 2, 3, boardGet(board, 2, 3));
  boardSet(copy, 3, 3, boardGet(board, 3, 3));
  return copy;
};

const boardGet = (board, x, y) => (
  board[`${x},${y}`]
);

const boardSet = (board, x, y, id) => {
  board[`${x},${y}`] = id;
  return board;
};

const boardValue = (board, id) => {
  return id.value;
};

const boardAddId = (board, id1, id2) => {
  const _id1 = {
    key: id1.key,
    value: id1.value * 2,
  };
  board.removedTiles.push({
    key: id2.key,
    value: id2.value,
    id1: _id1,
  });
  return _id1;
};

const boardNewId = board => {
  return {
    key: 'xxxxxxxx'.replace(/x/g, () => Math.random().toString(16)[2]),
    value: 2,
  };
};

const boardVertical = (board, direction = 1) => {
  const copy = boardCopy(board);

  for (let i = 0; i < 4; i++) {
    let column = (direction === 1 ? [0, 1, 2, 3] : [3, 2, 1, 0])
    .map(j => boardGet(copy, i, j))
    .filter(Boolean);
    for (let j = 0; j < column.length - 1; j++) {
      if (boardValue(board, column[j]) === boardValue(board, column[j + 1])) {
        column.splice(j, 2, boardAddId(copy, column[j], column[j + 1]));
        j++;
      }
    }
    for (
      let j = direction === 1 ? 0 : 3;
      direction === 1 ? (j < 4) : j >= 0;
      j += direction
    ) {
      boardSet(copy, i, j, column[direction === 1 ? j : 3 - j]);
    }
  }

  let row = [0, 1, 2, 3].map((i, index) => (
    !boardGet(copy, i, direction === 1 ? 3 : 0) ? index : null
  ))
  .filter(i => i !== null);
  if (row.length === 0) {
    throw new Error('Game Over');
  }
  const index = row[Math.random() * row.length | 0];
  boardSet(copy, index, direction === 1 ? 3 : 0, boardNewId(board));

  return copy;
};

const boardHorizontal = (board, direction = 1) => {
  const copy = boardCopy(board);
  for (let j = 0; j < 4; j++) {
    let row = (direction === 1 ? [0, 1, 2, 3] : [3, 2, 1, 0])
    .map(i => boardGet(copy, i, j))
    .filter(Boolean);
    for (let j = 0; j < row.length - 1; j++) {
      if (boardValue(board, row[j]) === boardValue(board, row[j + 1])) {
        row.splice(j, 2, boardAddId(copy, row[j], row[j + 1]));
        j++;
      }
    }
    for (
      let i = direction === 1 ? 0 : 3;
      direction === 1 ? (i < 4) : i >= 0;
      i += direction
    ) {
      boardSet(copy, i, j, row[direction === 1 ? i : 3 - i]);
    }
  }

  let row = [0, 1, 2, 3].map((i, index) => (
    !boardGet(copy, direction === 1 ? 3 : 0, i) ? index : null
  ))
  .filter(i => i !== null);
  if (row.length === 0) {
    throw new Error('Game Over');
  }
  const index = row[Math.random() * row.length | 0];
  boardSet(copy, direction === 1 ? 3 : 0, index, boardNewId(board));

  return copy;
};

module.exports = {
  boardNew,
  boardCopy,
  boardGet,
  boardValue,
  boardAddId,
  boardNewId,
  boardVertical,
  boardHorizontal,
};
