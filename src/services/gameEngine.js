/**
 * Core Game Engine for Tic Tac Toe
 * Owns game session state, move validation, win/draw detection, 
 * AI move selection, undo history, and scoreboard tracking.
 */

export const GAME_MODES = {
  TWO_PLAYER: 'TwoPlayer',
  COMPUTER: 'PlayAgainstComputer',
};

export const GAME_STATUS = {
  IN_PROGRESS: 'InProgress',
  WON: 'Won',
  DRAW: 'Draw',
};

export const PLAYERS = {
  X: 'X',
  O: 'O',
};

// Winning combinations on 3x3 grid
export const WINNING_LINES = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

export const CORNER_INDICES = [0, 2, 6, 8];
export const CENTER_INDEX = 4;

/**
 * Converts 0-indexed cell index to 1-indexed row and column
 */
export function indexToCoordinates(index) {
  if (index < 0 || index > 8) {
    throw new Error(`Invalid index: ${index}`);
  }
  const row = Math.floor(index / 3) + 1;
  const column = (index % 3) + 1;
  return {
    row,
    column,
    position: `Row ${row}, Column ${column}`,
  };
}

/**
 * Converts 1-indexed row and column to 0-indexed cell index
 */
export function coordinatesToIndex(row, column) {
  if (row < 1 || row > 3 || column < 1 || column > 3) {
    throw new Error(`Coordinates out of bounds: Row ${row}, Column ${column}`);
  }
  return (row - 1) * 3 + (column - 1);
}

/**
 * Checks for a win on the current board
 * Returns { winner, winningCells } or { winner: null, winningCells: null }
 */
export function checkWin(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a],
        winningCells: line,
      };
    }
  }
  return {
    winner: null,
    winningCells: null,
  };
}

/**
 * Checks if the board is full with no winner (Draw)
 */
export function checkDraw(board, hasWinner) {
  if (hasWinner) return false;
  return board.every(cell => cell !== null && cell !== '');
}

/**
 * Computer move logic according to specified priority:
 * 1. If O can win, play the winning move
 * 2. If X can win next, block X
 * 3. Take center if available (index 4)
 * 4. Take a corner if available (0, 2, 6, 8)
 * 5. Take any available cell
 */
export function calculateComputerMove(board) {
  const availableIndices = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null || board[i] === '') {
      availableIndices.push(i);
    }
  }

  if (availableIndices.length === 0) {
    return null;
  }

  // Priority 1: If O can win, play the winning move
  for (const idx of availableIndices) {
    const testBoard = [...board];
    testBoard[idx] = PLAYERS.O;
    if (checkWin(testBoard).winner === PLAYERS.O) {
      return { index: idx, priority: 1, reason: 'Winning move for O' };
    }
  }

  // Priority 2: If X can win next, block X
  for (const idx of availableIndices) {
    const testBoard = [...board];
    testBoard[idx] = PLAYERS.X;
    if (checkWin(testBoard).winner === PLAYERS.X) {
      return { index: idx, priority: 2, reason: 'Block winning move for X' };
    }
  }

  // Priority 3: Take center if available
  if (availableIndices.includes(CENTER_INDEX)) {
    return { index: CENTER_INDEX, priority: 3, reason: 'Take center' };
  }

  // Priority 4: Take a corner if available
  const availableCorners = CORNER_INDICES.filter(idx => availableIndices.includes(idx));
  if (availableCorners.length > 0) {
    // Choose first available corner (or deterministic corner)
    return { index: availableCorners[0], priority: 4, reason: 'Take available corner' };
  }

  // Priority 5: Take any available cell
  return { index: availableIndices[0], priority: 5, reason: 'Take first available cell' };
}

/**
 * Game session class encapsulating backend state management
 */
export class GameSession {
  constructor(id = `game-${Date.now()}`, gameMode = GAME_MODES.TWO_PLAYER) {
    this.id = id;
    this.gameMode = gameMode;
    this.board = Array(9).fill(null);
    this.currentPlayer = PLAYERS.X;
    this.gameStatus = GAME_STATUS.IN_PROGRESS;
    this.winner = null;
    this.winningCells = null;
    this.moveHistory = [];
    this.completedCounted = false; // prevents double counting in scoreboard
  }

  /**
   * Serializes current state to response matching API contract
   */
  getState(scoreboard = null) {
    return {
      gameId: this.id,
      board: [...this.board],
      currentPlayer: this.currentPlayer,
      gameMode: this.gameMode,
      gameStatus: this.gameStatus,
      winner: this.winner,
      winningCells: this.winningCells ? [...this.winningCells] : null,
      moveHistory: [...this.moveHistory],
      scoreboard: scoreboard ? { ...scoreboard } : null,
      canUndo: this.moveHistory.length > 0,
    };
  }

  /**
   * Validates and applies a move
   */
  makeMove(player, cellIndex) {
    // Validation 1: Move outside the board
    if (cellIndex < 0 || cellIndex > 8 || !Number.isInteger(cellIndex)) {
      throw new Error(`Invalid move: Cell index ${cellIndex} is outside the board.`);
    }

    // Validation 2: Move after game completion
    if (this.gameStatus !== GAME_STATUS.IN_PROGRESS) {
      throw new Error(`Invalid move: The game is already ${this.gameStatus}.`);
    }

    // Validation 3: Move by the wrong player
    if (player !== this.currentPlayer) {
      throw new Error(`Invalid move: It is player ${this.currentPlayer}'s turn, not ${player}.`);
    }

    // Validation 4: Move on an occupied cell
    if (this.board[cellIndex] !== null) {
      throw new Error(`Invalid move: Cell ${cellIndex} is already occupied by ${this.board[cellIndex]}.`);
    }

    // Apply move
    this.board[cellIndex] = player;
    const { row, column, position } = indexToCoordinates(cellIndex);
    const moveItem = {
      moveNumber: this.moveHistory.length + 1,
      player,
      cellIndex,
      row,
      column,
      position,
      timestamp: Date.now(),
    };
    this.moveHistory.push(moveItem);

    // Win check
    const winResult = checkWin(this.board);
    if (winResult.winner) {
      this.winner = winResult.winner;
      this.winningCells = winResult.winningCells;
      this.gameStatus = GAME_STATUS.WON;
      return { success: true, gameStatus: this.gameStatus, winner: this.winner };
    }

    // Draw check
    if (checkDraw(this.board, false)) {
      this.gameStatus = GAME_STATUS.DRAW;
      this.winner = null;
      this.winningCells = null;
      return { success: true, gameStatus: this.gameStatus, winner: null };
    }

    // Switch player
    this.currentPlayer = this.currentPlayer === PLAYERS.X ? PLAYERS.O : PLAYERS.X;
    return { success: true, gameStatus: this.gameStatus, winner: null };
  }

  /**
   * Resets the game to initial fresh state
   */
  resetGame() {
    this.board = Array(9).fill(null);
    this.currentPlayer = PLAYERS.X;
    this.gameStatus = GAME_STATUS.IN_PROGRESS;
    this.winner = null;
    this.winningCells = null;
    this.moveHistory = [];
    this.completedCounted = false;
  }

  /**
   * Reconstructs board and status from move history
   */
  _reconstructState() {
    this.board = Array(9).fill(null);
    this.currentPlayer = PLAYERS.X;
    this.gameStatus = GAME_STATUS.IN_PROGRESS;
    this.winner = null;
    this.winningCells = null;
    this.completedCounted = false;

    for (let i = 0; i < this.moveHistory.length; i++) {
      const move = this.moveHistory[i];
      move.moveNumber = i + 1; // re-index moves
      this.board[move.cellIndex] = move.player;

      // Check win or draw up to this point
      const winResult = checkWin(this.board);
      if (winResult.winner) {
        this.winner = winResult.winner;
        this.winningCells = winResult.winningCells;
        this.gameStatus = GAME_STATUS.WON;
        return;
      }

      if (checkDraw(this.board, false)) {
        this.gameStatus = GAME_STATUS.DRAW;
        return;
      }

      this.currentPlayer = move.player === PLAYERS.X ? PLAYERS.O : PLAYERS.X;
    }
  }

  /**
   * Undo last move based on mode:
   * Two Player Mode: Removes only the most recent move.
   * Computer Mode: Removes computer's last move AND human's previous move together.
   * Returns: { undoneResult: 'Won'|'Draw'|null, previousWinner: 'X'|'O'|null }
   */
  undo() {
    if (this.moveHistory.length === 0) {
      throw new Error('No moves to undo.');
    }

    const previousStatus = this.gameStatus;
    const previousWinner = this.winner;

    if (this.gameMode === GAME_MODES.TWO_PLAYER) {
      // Remove latest move
      this.moveHistory.pop();
    } else {
      // Computer Mode
      // If the latest move was made by computer (O), pop both O's move and X's move
      const lastMove = this.moveHistory[this.moveHistory.length - 1];
      if (lastMove.player === PLAYERS.O && this.moveHistory.length >= 2) {
        this.moveHistory.pop(); // Remove O
        this.moveHistory.pop(); // Remove X
      } else if (lastMove.player === PLAYERS.X) {
        // Human moved and won before computer moved, or computer had not moved yet
        this.moveHistory.pop();
      } else {
        this.moveHistory.pop();
      }
    }

    this._reconstructState();

    return {
      previousStatus,
      previousWinner,
      reversedCompletion: previousStatus !== GAME_STATUS.IN_PROGRESS,
    };
  }
}
