import { describe, it, expect, beforeEach } from 'vitest';
import {
  GameSession,
  GAME_MODES,
  GAME_STATUS,
  PLAYERS,
  checkWin,
  checkDraw,
  calculateComputerMove,
  indexToCoordinates,
  coordinatesToIndex,
} from './gameEngine';

describe('Game Engine & Rules', () => {
  let session;

  beforeEach(() => {
    session = new GameSession('test-game', GAME_MODES.TWO_PLAYER);
  });

  // 1. Coordinate transformations
  it('converts between index and 1-indexed row/column coordinates correctly', () => {
    // 0 -> Row 1, Column 1
    expect(indexToCoordinates(0)).toEqual({
      row: 1,
      column: 1,
      position: 'Row 1, Column 1',
    });
    // 4 -> Row 2, Column 2
    expect(indexToCoordinates(4)).toEqual({
      row: 2,
      column: 2,
      position: 'Row 2, Column 2',
    });
    // 8 -> Row 3, Column 3
    expect(indexToCoordinates(8)).toEqual({
      row: 3,
      column: 3,
      position: 'Row 3, Column 3',
    });

    expect(coordinatesToIndex(1, 1)).toBe(0);
    expect(coordinatesToIndex(2, 2)).toBe(4);
    expect(coordinatesToIndex(3, 3)).toBe(8);
  });

  // 2. Valid move
  it('handles a valid move correctly', () => {
    const result = session.makeMove(PLAYERS.X, 0);
    expect(result.success).toBe(true);
    expect(session.board[0]).toBe(PLAYERS.X);
    expect(session.moveHistory).toHaveLength(1);
    expect(session.moveHistory[0]).toMatchObject({
      moveNumber: 1,
      player: PLAYERS.X,
      cellIndex: 0,
      row: 1,
      column: 1,
      position: 'Row 1, Column 1',
    });
  });

  // 3. Invalid move - occupied cell
  it('rejects an invalid move when cell is already occupied', () => {
    session.makeMove(PLAYERS.X, 0);
    expect(() => {
      session.makeMove(PLAYERS.O, 0);
    }).toThrow(/already occupied/);
  });

  // 4. Invalid move - wrong player turn
  it('rejects an invalid move when the wrong player attempts to move', () => {
    expect(() => {
      session.makeMove(PLAYERS.O, 0); // X should start
    }).toThrow(/It is player X's turn, not O/);
  });

  // 5. Invalid move - outside the board
  it('rejects an invalid move outside the board', () => {
    expect(() => {
      session.makeMove(PLAYERS.X, 9);
    }).toThrow(/outside the board/);
    expect(() => {
      session.makeMove(PLAYERS.X, -1);
    }).toThrow(/outside the board/);
  });

  // 6. Turn switching
  it('switches turns accurately after every valid move', () => {
    expect(session.currentPlayer).toBe(PLAYERS.X);
    session.makeMove(PLAYERS.X, 0);
    expect(session.currentPlayer).toBe(PLAYERS.O);
    session.makeMove(PLAYERS.O, 1);
    expect(session.currentPlayer).toBe(PLAYERS.X);
  });

  // 7. Row win detection
  it('detects a row win correctly and highlights winning cells', () => {
    // X plays top row: 0, 1, 2
    session.makeMove(PLAYERS.X, 0); // X
    session.makeMove(PLAYERS.O, 3); // O
    session.makeMove(PLAYERS.X, 1); // X
    session.makeMove(PLAYERS.O, 4); // O
    session.makeMove(PLAYERS.X, 2); // X completes row 1

    expect(session.gameStatus).toBe(GAME_STATUS.WON);
    expect(session.winner).toBe(PLAYERS.X);
    expect(session.winningCells).toEqual([0, 1, 2]);
  });

  // 8. Column win detection
  it('detects a column win correctly', () => {
    // O plays middle column: 1, 4, 7
    session.makeMove(PLAYERS.X, 0); // X
    session.makeMove(PLAYERS.O, 1); // O
    session.makeMove(PLAYERS.X, 2); // X
    session.makeMove(PLAYERS.O, 4); // O
    session.makeMove(PLAYERS.X, 8); // X
    session.makeMove(PLAYERS.O, 7); // O completes column 2

    expect(session.gameStatus).toBe(GAME_STATUS.WON);
    expect(session.winner).toBe(PLAYERS.O);
    expect(session.winningCells).toEqual([1, 4, 7]);
  });

  // 9. Diagonal win detection
  it('detects a diagonal win correctly', () => {
    // X plays diagonal: 0, 4, 8
    session.makeMove(PLAYERS.X, 0); // X
    session.makeMove(PLAYERS.O, 1); // O
    session.makeMove(PLAYERS.X, 4); // X
    session.makeMove(PLAYERS.O, 2); // O
    session.makeMove(PLAYERS.X, 8); // X completes diagonal

    expect(session.gameStatus).toBe(GAME_STATUS.WON);
    expect(session.winner).toBe(PLAYERS.X);
    expect(session.winningCells).toEqual([0, 4, 8]);
  });

  // 10. Draw detection
  it('detects a draw when all 9 cells are filled and no winner', () => {
    // Board:
    // X O X
    // X X O
    // O X O
    const moves = [
      { p: PLAYERS.X, idx: 0 },
      { p: PLAYERS.O, idx: 1 },
      { p: PLAYERS.X, idx: 2 },
      { p: PLAYERS.O, idx: 5 },
      { p: PLAYERS.X, idx: 3 },
      { p: PLAYERS.O, idx: 6 },
      { p: PLAYERS.X, idx: 4 },
      { p: PLAYERS.O, idx: 8 },
      { p: PLAYERS.X, idx: 7 },
    ];

    for (const m of moves) {
      session.makeMove(m.p, m.idx);
    }

    expect(session.gameStatus).toBe(GAME_STATUS.DRAW);
    expect(session.winner).toBeNull();
    expect(session.winningCells).toBeNull();
  });

  // 11. Move after game completion rejected
  it('rejects moves after game completion', () => {
    // Win game
    session.makeMove(PLAYERS.X, 0);
    session.makeMove(PLAYERS.O, 3);
    session.makeMove(PLAYERS.X, 1);
    session.makeMove(PLAYERS.O, 4);
    session.makeMove(PLAYERS.X, 2); // X wins

    expect(session.gameStatus).toBe(GAME_STATUS.WON);

    expect(() => {
      session.makeMove(PLAYERS.O, 5);
    }).toThrow(/already Won/);
  });

  // 12. Reset game
  it('resets game state back to fresh session', () => {
    session.makeMove(PLAYERS.X, 0);
    session.makeMove(PLAYERS.O, 4);
    expect(session.moveHistory).toHaveLength(2);

    session.resetGame();

    expect(session.board.every(c => c === null)).toBe(true);
    expect(session.currentPlayer).toBe(PLAYERS.X);
    expect(session.gameStatus).toBe(GAME_STATUS.IN_PROGRESS);
    expect(session.winner).toBeNull();
    expect(session.winningCells).toBeNull();
    expect(session.moveHistory).toHaveLength(0);
  });

  // 13. Undo in Two Player Mode
  it('undoes only the most recent move in Two Player mode', () => {
    session.makeMove(PLAYERS.X, 0);
    session.makeMove(PLAYERS.O, 4);
    expect(session.moveHistory).toHaveLength(2);
    expect(session.currentPlayer).toBe(PLAYERS.X);

    session.undo();

    // Should remove O's move and leave X's move
    expect(session.moveHistory).toHaveLength(1);
    expect(session.board[4]).toBeNull();
    expect(session.board[0]).toBe(PLAYERS.X);
    expect(session.currentPlayer).toBe(PLAYERS.O); // It is O's turn again
  });

  // 14. Undo in Computer Mode
  it('undoes both the computer move and the human player move in Computer Mode', () => {
    const compSession = new GameSession('comp-game', GAME_MODES.COMPUTER);
    compSession.makeMove(PLAYERS.X, 0);
    compSession.makeMove(PLAYERS.O, 4); // Computer moved

    expect(compSession.moveHistory).toHaveLength(2);
    expect(compSession.currentPlayer).toBe(PLAYERS.X);

    compSession.undo();

    // Both O's and X's moves should be removed
    expect(compSession.moveHistory).toHaveLength(0);
    expect(compSession.board[0]).toBeNull();
    expect(compSession.board[4]).toBeNull();
    expect(compSession.currentPlayer).toBe(PLAYERS.X); // It is X's turn again
  });

  // 15. Undo disabled / throws when history is empty
  it('throws an error when trying to undo with no moves', () => {
    expect(() => {
      session.undo();
    }).toThrow(/No moves to undo/);
  });

  // 16. Computer move selection priority rules
  describe('Computer Move Selection (Priority 1 through 5)', () => {
    it('Priority 1: Plays winning move for O if available', () => {
      // Board: O at 0, 1; available at 2. X at 4, 5
      const board = [
        PLAYERS.O, PLAYERS.O, null,
        null, PLAYERS.X, PLAYERS.X,
        null, null, null,
      ];
      const move = calculateComputerMove(board);
      expect(move.priority).toBe(1);
      expect(move.index).toBe(2);
    });

    it('Priority 2: Blocks X from winning if X has 2 in a line', () => {
      // Board: X at 0, 1; O at 4.
      const board = [
        PLAYERS.X, PLAYERS.X, null,
        null, PLAYERS.O, null,
        null, null, null,
      ];
      const move = calculateComputerMove(board);
      expect(move.priority).toBe(2);
      expect(move.index).toBe(2);
    });

    it('Priority 3: Takes center (index 4) if available', () => {
      // Board: X at 0; no immediate win or block
      const board = [
        PLAYERS.X, null, null,
        null, null, null,
        null, null, null,
      ];
      const move = calculateComputerMove(board);
      expect(move.priority).toBe(3);
      expect(move.index).toBe(4);
    });

    it('Priority 4: Takes an available corner (0, 2, 6, 8) if center is taken', () => {
      // Board: Center (4) taken by X
      const board = [
        null, null, null,
        null, PLAYERS.X, null,
        null, null, null,
      ];
      const move = calculateComputerMove(board);
      expect(move.priority).toBe(4);
      expect([0, 2, 6, 8]).toContain(move.index);
    });

    it('Priority 5: Takes any available cell when center and corners are taken', () => {
      // Corners (0, 2, 6, 8) and center (4) taken, no 2-in-a-row threats
      // Row 0: X, O, X
      // Row 1: X, O, null (cell 5 is available)
      // Row 2: O, X, O
      const board = [
        PLAYERS.X, PLAYERS.O, PLAYERS.X,
        PLAYERS.X, PLAYERS.O, null,
        PLAYERS.O, PLAYERS.X, PLAYERS.O,
      ];
      const move = calculateComputerMove(board);
      expect(move.priority).toBe(5);
      expect(move.index).toBe(5);
    });
  });
});
