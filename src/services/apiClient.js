/**
 * REST API Client & In-Memory Backend Service
 * 
 * Implements the full REST API contract requested in the specification:
 * - POST /api/games
 * - GET  /api/games/{id}
 * - POST /api/games/{id}/moves
 * - POST /api/games/{id}/undo
 * - POST /api/games/{id}/reset
 * - GET  /api/scoreboard
 * - POST /api/scoreboard/reset
 * 
 * Includes Option B for Clarification 2: 
 * Scoreboard is adjusted if an Undo reverses a completed game result.
 */

import {
  GameSession,
  GAME_MODES,
  GAME_STATUS,
  PLAYERS,
  calculateComputerMove,
  coordinatesToIndex,
} from './gameEngine';

class MockBackendService {
  constructor() {
    this.games = new Map();
    this.activeGameId = null;
    this.scoreboard = {
      xWins: 0,
      oWins: 0,
      draws: 0,
      totalGames: 0,
    };
    this.loadScoreboard();
  }

  loadScoreboard() {
    try {
      const saved = localStorage.getItem('ttt_scoreboard');
      if (saved) {
        this.scoreboard = JSON.parse(saved);
      }
    } catch {
      // fallback to memory
    }
  }

  saveScoreboard() {
    try {
      localStorage.setItem('ttt_scoreboard', JSON.stringify(this.scoreboard));
    } catch {
      // ignore
    }
  }

  /**
   * Updates scoreboard upon game completion (only once per completion)
   */
  handleGameCompletion(game) {
    if (game.completedCounted) return;

    if (game.gameStatus === GAME_STATUS.WON) {
      if (game.winner === PLAYERS.X) {
        this.scoreboard.xWins += 1;
      } else if (game.winner === PLAYERS.O) {
        this.scoreboard.oWins += 1;
      }
      this.scoreboard.totalGames += 1;
      game.completedCounted = true;
      this.saveScoreboard();
    } else if (game.gameStatus === GAME_STATUS.DRAW) {
      this.scoreboard.draws += 1;
      this.scoreboard.totalGames += 1;
      game.completedCounted = true;
      this.saveScoreboard();
    }
  }

  /**
   * Adjusts scoreboard when Undo reverses a completed game (Option B)
   */
  handleUndoReversal(previousStatus, previousWinner) {
    if (previousStatus === GAME_STATUS.WON) {
      if (previousWinner === PLAYERS.X && this.scoreboard.xWins > 0) {
        this.scoreboard.xWins -= 1;
      } else if (previousWinner === PLAYERS.O && this.scoreboard.oWins > 0) {
        this.scoreboard.oWins -= 1;
      }
      if (this.scoreboard.totalGames > 0) this.scoreboard.totalGames -= 1;
      this.saveScoreboard();
    } else if (previousStatus === GAME_STATUS.DRAW) {
      if (this.scoreboard.draws > 0) {
        this.scoreboard.draws -= 1;
      }
      if (this.scoreboard.totalGames > 0) this.scoreboard.totalGames -= 1;
      this.saveScoreboard();
    }
  }

  // --- API Endpoints ---

  /**
   * POST /api/games
   * Body: { gameMode?: 'TwoPlayer' | 'PlayAgainstComputer' }
   */
  async createGame(gameMode = GAME_MODES.TWO_PLAYER) {
    const gameId = `game-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const session = new GameSession(gameId, gameMode);
    this.games.set(gameId, session);
    this.activeGameId = gameId;
    return session.getState(this.scoreboard);
  }

  /**
   * GET /api/games/{id}
   */
  async getGame(id) {
    const session = this.games.get(id);
    if (!session) {
      throw new Error(`Game not found: ${id}`);
    }
    return session.getState(this.scoreboard);
  }

  /**
   * POST /api/games/{id}/moves
   * Body: { player: 'X'|'O', cellIndex?: number, row?: number, column?: number }
   */
  async makeMove(id, { player, cellIndex, row, column }) {
    const session = this.games.get(id);
    if (!session) {
      throw new Error(`Game not found: ${id}`);
    }

    let targetIndex = cellIndex;
    if (targetIndex === undefined && row !== undefined && column !== undefined) {
      targetIndex = coordinatesToIndex(row, column);
    }

    // Apply player's move
    session.makeMove(player, targetIndex);

    // If game ended, update scoreboard
    if (session.gameStatus !== GAME_STATUS.IN_PROGRESS) {
      this.handleGameCompletion(session);
    }

    // If mode is PlayAgainstComputer, human just played X, and game is still InProgress:
    // Computer (O) automatically moves
    let computerMoveMeta = null;
    if (
      session.gameMode === GAME_MODES.COMPUTER &&
      session.gameStatus === GAME_STATUS.IN_PROGRESS &&
      session.currentPlayer === PLAYERS.O
    ) {
      const compCalc = calculateComputerMove(session.board);
      if (compCalc) {
        session.makeMove(PLAYERS.O, compCalc.index);
        computerMoveMeta = compCalc;

        if (session.gameStatus !== GAME_STATUS.IN_PROGRESS) {
          this.handleGameCompletion(session);
        }
      }
    }

    const state = session.getState(this.scoreboard);
    return {
      ...state,
      computerMoveMeta,
    };
  }

  /**
   * POST /api/games/{id}/undo
   */
  async undo(id) {
    const session = this.games.get(id);
    if (!session) {
      throw new Error(`Game not found: ${id}`);
    }

    const undoResult = session.undo();
    if (undoResult.reversedCompletion) {
      this.handleUndoReversal(undoResult.previousStatus, undoResult.previousWinner);
    }

    return session.getState(this.scoreboard);
  }

  /**
   * POST /api/games/{id}/reset
   */
  async resetGame(id) {
    const session = this.games.get(id);
    if (!session) {
      throw new Error(`Game not found: ${id}`);
    }

    session.resetGame();
    return session.getState(this.scoreboard);
  }

  /**
   * GET /api/scoreboard
   */
  async getScoreboard() {
    return { ...this.scoreboard };
  }

  /**
   * POST /api/scoreboard/reset
   */
  async resetScoreboard() {
    this.scoreboard = {
      xWins: 0,
      oWins: 0,
      draws: 0,
      totalGames: 0,
    };
    this.saveScoreboard();
    return { ...this.scoreboard };
  }
}

// Singleton backend instance
export const mockBackend = new MockBackendService();

/**
 * Universal Game API Client
 * Facilitates simulated asynchronous REST API interaction,
 * with full readiness for remote .NET backend integration.
 */
export const gameApi = {
  async createGame(gameMode) {
    await simulateNetworkDelay();
    return mockBackend.createGame(gameMode);
  },

  async getGame(id) {
    await simulateNetworkDelay();
    return mockBackend.getGame(id);
  },

  async makeMove(id, moveData) {
    await simulateNetworkDelay();
    return mockBackend.makeMove(id, moveData);
  },

  async undo(id) {
    await simulateNetworkDelay();
    return mockBackend.undo(id);
  },

  async resetGame(id) {
    await simulateNetworkDelay();
    return mockBackend.resetGame(id);
  },

  async getScoreboard() {
    await simulateNetworkDelay();
    return mockBackend.getScoreboard();
  },

  async resetScoreboard() {
    await simulateNetworkDelay();
    return mockBackend.resetScoreboard();
  },
};

function simulateNetworkDelay(ms = 30) {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return Promise.resolve();
  }
  return new Promise(resolve => setTimeout(resolve, ms));
}
