import { describe, it, expect, beforeEach } from 'vitest';
import { gameApi } from './apiClient';
import { GAME_MODES, GAME_STATUS, PLAYERS } from './gameEngine';

describe('REST API Client & Service Contract', () => {
  beforeEach(async () => {
    await gameApi.resetScoreboard();
  });

  it('POST /api/games creates a new game session with expected contract', async () => {
    const game = await gameApi.createGame(GAME_MODES.TWO_PLAYER);
    expect(game.gameId).toBeDefined();
    expect(game.board).toHaveLength(9);
    expect(game.board.every(c => c === null)).toBe(true);
    expect(game.currentPlayer).toBe(PLAYERS.X);
    expect(game.gameMode).toBe(GAME_MODES.TWO_PLAYER);
    expect(game.gameStatus).toBe(GAME_STATUS.IN_PROGRESS);
    expect(game.winner).toBeNull();
    expect(game.winningCells).toBeNull();
    expect(game.moveHistory).toEqual([]);
    expect(game.canUndo).toBe(false);
  });

  it('GET /api/games/{id} retrieves the existing game state', async () => {
    const created = await gameApi.createGame(GAME_MODES.TWO_PLAYER);
    const retrieved = await gameApi.getGame(created.gameId);
    expect(retrieved.gameId).toBe(created.gameId);
    expect(retrieved.currentPlayer).toBe(PLAYERS.X);
  });

  it('POST /api/games/{id}/moves validates and registers moves', async () => {
    const game = await gameApi.createGame(GAME_MODES.TWO_PLAYER);
    const afterMove = await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 4 });

    expect(afterMove.board[4]).toBe(PLAYERS.X);
    expect(afterMove.currentPlayer).toBe(PLAYERS.O);
    expect(afterMove.moveHistory).toHaveLength(1);
    expect(afterMove.moveHistory[0].position).toBe('Row 2, Column 2');
    expect(afterMove.canUndo).toBe(true);
  });

  it('Scoreboard updates when game finishes and only once per game', async () => {
    const game = await gameApi.createGame(GAME_MODES.TWO_PLAYER);

    // X wins top row (0, 1, 2)
    await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 0 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.O, cellIndex: 3 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 1 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.O, cellIndex: 4 });
    const wonState = await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 2 });

    expect(wonState.gameStatus).toBe(GAME_STATUS.WON);
    expect(wonState.winner).toBe(PLAYERS.X);

    const sb = await gameApi.getScoreboard();
    expect(sb.xWins).toBe(1);
    expect(sb.oWins).toBe(0);
    expect(sb.draws).toBe(0);
    expect(sb.totalGames).toBe(1);
  });

  it('Option B: Undo after completion adjusts scoreboard back accurately', async () => {
    const game = await gameApi.createGame(GAME_MODES.TWO_PLAYER);

    // X wins
    await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 0 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.O, cellIndex: 3 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 1 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.O, cellIndex: 4 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 2 });

    let sb = await gameApi.getScoreboard();
    expect(sb.xWins).toBe(1);

    // Undo winning move
    const undoneState = await gameApi.undo(game.gameId);
    expect(undoneState.gameStatus).toBe(GAME_STATUS.IN_PROGRESS);
    expect(undoneState.winner).toBeNull();

    // Verify scoreboard was adjusted
    sb = await gameApi.getScoreboard();
    expect(sb.xWins).toBe(0);
    expect(sb.totalGames).toBe(0);
  });

  it('Reset Game clears board but preserves scoreboard', async () => {
    const game = await gameApi.createGame(GAME_MODES.TWO_PLAYER);

    // X wins
    await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 0 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.O, cellIndex: 3 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 1 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.O, cellIndex: 4 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 2 });

    // Reset game
    const resetState = await gameApi.resetGame(game.gameId);
    expect(resetState.board.every(c => c === null)).toBe(true);
    expect(resetState.moveHistory).toHaveLength(0);
    expect(resetState.gameStatus).toBe(GAME_STATUS.IN_PROGRESS);

    // Scoreboard remains intact
    const sb = await gameApi.getScoreboard();
    expect(sb.xWins).toBe(1);
  });

  it('POST /api/scoreboard/reset zeroes out scores', async () => {
    const game = await gameApi.createGame(GAME_MODES.TWO_PLAYER);

    // Win a game to have score
    await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 0 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.O, cellIndex: 3 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 1 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.O, cellIndex: 4 });
    await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 2 });

    const beforeReset = await gameApi.getScoreboard();
    expect(beforeReset.xWins).toBe(1);

    const afterReset = await gameApi.resetScoreboard();
    expect(afterReset.xWins).toBe(0);
    expect(afterReset.oWins).toBe(0);
    expect(afterReset.draws).toBe(0);
  });

  it('Computer Mode automatically executes computer move after human move', async () => {
    const game = await gameApi.createGame(GAME_MODES.COMPUTER);

    // Human plays X at corner 0
    const state = await gameApi.makeMove(game.gameId, { player: PLAYERS.X, cellIndex: 0 });

    // Both X's move and O's automated response should be recorded
    expect(state.board[0]).toBe(PLAYERS.X);
    expect(state.moveHistory.length).toBeGreaterThanOrEqual(2);
    expect(state.moveHistory[0].player).toBe(PLAYERS.X);
    expect(state.moveHistory[1].player).toBe(PLAYERS.O);

    // Next turn is back to Human (X)
    expect(state.currentPlayer).toBe(PLAYERS.X);
  });
});
