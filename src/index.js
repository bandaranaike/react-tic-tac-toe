import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


/**
 * Steps are as follow
 * 1. Get initial state from server : winner, history, xIsNext, save it in db
 * 2. Assing values to the state in front end
 * 3. Allow player to play
 * 4. On click send the clicked square
 * 5. Save it in database
 *    i.  table: history(player_id, step_number, steps)
 *    ii. table: player(uuid, winning_symbol) 
 * 6. Do the calculations from backend and send winner, history and xIsNext to the front end
 */




function Square(props) {
  return (
    <button className='square' onClick={props.onClick}>
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    return <Square value={this.props.squares[i]} onClick={() => this.props.onClick(i)} />;
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null)
      }]
    }
  }

  componentDidMount() {
    this.updateServerData(-1);
  }

  restartGame = (status) => {
    if (status) {
      fetch("http://localhost:3001/api/reset-game", { method: "POST" })
        .then(r => r.json())
        .then(data => {
          console.log("data", data)
          this.setState(data)
        });
    }
  }

  handleClick(i) {
    const history = this.state.history; // Get from api
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (this.state.winner || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';

    this.updateServerData(i);
  }

  updateServerData(i) {
    fetch("http://localhost:3001/api/update-data", {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        square: i,
        xIsNext: this.state.xIsNext
      })
    }).then(r => r.json()).then(r => this.setState(r.data))
  }

  render() {
    const history = this.state.history;
    const current = history[history.length - 1];

    let status;

    if (this.state.winner) {
      status = "Winner: " + this.state.winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={(k) => this.restartGame(true)}>Restart Game</button>
        </div>
      </div>
    );
  }
}


// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
