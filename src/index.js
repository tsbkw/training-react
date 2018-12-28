import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

function Square(props) {
  const className = props.isHighlight ? "square highlight" : "square";
  return (
    <button className={className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

const isWin = function(squares) {
  const s = squares;
  const winTuples = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < winTuples.length; i++) {
    const tuple = winTuples[i];
    if (squares[tuple[0]] !== null
       && squares[tuple[0]] === squares[tuple[1]]
       && squares[tuple[1]] === squares[tuple[2]]) {
         return tuple;
    }
  }
  return false;
  // return ((s[0] !== null && s[0] === s[1]  && s[0] === s[2])
  //   || (s[3] !== null && s[3] === s[4] && s[3] === s[5])
  //   || (s[6] !== null && s[6] === s[7] && s[6] === s[8])
  //   || (s[0] !== null && s[0] === s[3] && s[0] === s[6])
  //   || (s[1] !== null && s[1] === s[4] && s[4] === s[7])
  //   || (s[2] !== null && s[2] === s[5] && s[5] === s[8])
  //   || (s[0] !== null && s[0] === s[4] && s[4] === s[8])
  //   || (s[2] !== null && s[2] === s[4] && s[4] === s[6]));
};


const playerLabel = {true: "X", false: "O"};

const getNextPlayer = function(xIsNext) {
  return playerLabel[xIsNext];
}

const getLastPlayer = function(xIsNext) {
  return playerLabel[!xIsNext];
}


class Board extends React.Component {

  renderSquare(i) {
    const isWinResult = isWin(this.props.squares);
    return <Square
      value={this.props.squares[i]}
      isHighlight={isWinResult ? isWinResult.includes(i) : false}
      onClick={() => this.props.onClick(i)}
      col={i%3}
      row={i/3}
    />;
  }

  render() {
    let board = [];
    for (let i = 0; i < 3; i++) {
      let row = [];
      for (let j = 0; j < 3; j++) {
        row.push(this.renderSquare(i * 3 + j));
      }
      board.push(<div className="board-row">
        {row}
      </div>);
    }

    return (
      <div>
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: new Array(9).fill(null),
        xIsNext: true,
        lastClicked: null,
      }],
      order: "dessending",
    }
  }

  getCurrent() {
    const history = this.state.history;
    const current = history[history.length - 1];
    return current; 
  }

  isValidClick(current, i) {
    return current.squares[i] === null
      && !isWin(current.squares);
  }

  handleClick(i) {
    const current = this.getCurrent();
    if (this.isValidClick(current, i)) {
      const newState = {};
      const squares = current.squares.slice();
      squares[i] = getNextPlayer(current.xIsNext);
      newState.xIsNext = !current.xIsNext;
      newState.squares = squares;
      newState.lastClicked = i;
      newState.history = this.state.history.concat(newState);
      this.setState(newState);
    }
  }

  jumpTo(i) {
    const slicedHistory = this.state.history.slice(0, i + 1);
    this.setState({history: slicedHistory});
    this.render();
  }

  order() {
    const newState = {};
    Object.assign(newState, this.state);
    newState.order = this.state.order==="ascending" ?
        "descending" :
        "ascending"; 
    this.setState(newState);
  }

  render() {
    const history = this.state.history;
    const current = this.getCurrent();
    const status = isWin(current.squares) ?
      'Winner is ' + getLastPlayer(current.xIsNext) :
      (history.length === 10) ?
      'Draw':
      'Next player: ' + getNextPlayer(current.xIsNext);

    let moves = history.map((step, move) => {
      const location = step.lastClicked;
      let desc = (move ? // show which move to go back
        'Go to move #' + move :
        'Go to start')
        + (location != null ? // show col, row of last clicked location
        ` (${location % 3}, ${Math.floor(location/3)})` :
        "");
      if (move === (history.length - 1)) {
        desc = [<b>{desc}</b>];
      }
      return (
        <li key={"move#"+move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    if (this.state.order === "descending") {
      let newOrdered = [];
      for (let i = moves.length - 1; i > -1; i--) {
        newOrdered.push(moves[i]);
      }
      moves = newOrdered;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares = {current.squares}
            onClick = {(i) => this.handleClick(i)}
            wins = {isWin(current.squares)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <Toggle
            order={this.state.order}
            onClick={() => this.order()}
          />
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function Toggle(props) {
  return (
    <div>
      <button onClick={props.onClick}>
        {props.order}
      </button>
    </div>
  );
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
