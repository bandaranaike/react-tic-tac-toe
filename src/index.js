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

  async componentDidMount() {
    let { history, xIsNext, winner } = await getInformationFromBackend()
    console.log("history 5555", history)
    this.setState({
      history, xIsNext, winner
    })
  }

  handleClick(i) {
    const history = this.state.history; // Get from api
    const current = history[history.length - 1];
    const squares = current.squares.slice();


    if (this.state.winner || squares[i]) {
      return;
    }

     squares[i] = this.state.xIsNext ? 'X' : 'O';

     this.setState({ // Push to the api
      history: history.concat([{ squares: squares, }]), xIsNext: !this.state.xIsNext,
    });

    fetch("http://localhost:3001/api/update-data", {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        square: i,
        xIsNext: this.state.xIsNext
      })
    })
  }

  render() {
    const history = this.state.history; // Get from api
    console.log("hiostory 2", history)
    const current = history[history.length - 1];
    console.log("current", current)

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
          <ol>{/* TODO */}</ol>
        </div>
      </div>
    );
  }
}

async function getInformationFromBackend() {
  let history;
  await fetch("http://localhost:3001/api/initial-data").then(re => re.json()).then(r => {
    history = r;
    console.log("history", history)
  })
  return history;
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null;
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);
