import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Scoreboard } from './components/Scoreboard';
import { GameStatus } from './components/GameStatus';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { MoveHistory } from './components/MoveHistory';
import { PanelReviewModal } from './components/PanelReviewModal';
import { gameApi } from './services/apiClient';
import { sound } from './utils/audio';
import { GAME_MODES, GAME_STATUS, PLAYERS } from './services/gameEngine';

export default function App() {
  const [gameState, setGameState] = useState({
    gameId: null,
    board: Array(9).fill(null),
    currentPlayer: PLAYERS.X,
    gameMode: GAME_MODES.TWO_PLAYER,
    gameStatus: GAME_STATUS.IN_PROGRESS,
    winner: null,
    winningCells: null,
    moveHistory: [],
    canUndo: false,
  });

  const [scoreboard, setScoreboard] = useState({
    xWins: 0,
    oWins: 0,
    draws: 0,
    totalGames: 0,
  });

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isGameBusy, setIsGameBusy] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 3000);
  }, []);

  // Initialize game on load
  const initGame = useCallback(async (mode = gameState.gameMode) => {
    try {
      setIsGameBusy(true);
      const newGame = await gameApi.createGame(mode);
      const sb = await gameApi.getScoreboard();
      setGameState(newGame);
      setScoreboard(sb);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsGameBusy(false);
    }
  }, [gameState.gameMode, showNotification]);

  useEffect(() => {
    initGame();
  }, []);

  // Trigger confetti and victory audio when game is won
  useEffect(() => {
    if (gameState.gameStatus === GAME_STATUS.WON) {
      sound.playWin();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#ec4899', '#f59e0b', '#10b981'],
        });
      } catch {
        // fallback if canvas-confetti fails
      }
    } else if (gameState.gameStatus === GAME_STATUS.DRAW) {
      sound.playDraw();
    }
  }, [gameState.gameStatus]);

  // Handle cell click
  const handleCellClick = async (cellIndex) => {
    if (
      isGameBusy ||
      isAiThinking ||
      gameState.gameStatus !== GAME_STATUS.IN_PROGRESS ||
      gameState.board[cellIndex] !== null
    ) {
      return;
    }

    const playerMoving = gameState.currentPlayer;
    sound.playMove(playerMoving);

    try {
      // In Computer Mode, if playing against AI, provide a short visual "AI is thinking" touch
      if (gameState.gameMode === GAME_MODES.COMPUTER && playerMoving === PLAYERS.X) {
        setIsAiThinking(true);
      }

      setIsGameBusy(true);
      const updatedState = await gameApi.makeMove(gameState.gameId, {
        player: playerMoving,
        cellIndex,
      });

      // Brief pause for AI natural feel if computer mode played a move
      if (updatedState.computerMoveMeta) {
        if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test') {
          await new Promise(res => setTimeout(res, 280));
        }
        sound.playMove(PLAYERS.O);
      }

      setGameState(updatedState);
      if (updatedState.scoreboard) {
        setScoreboard(updatedState.scoreboard);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsAiThinking(false);
      setIsGameBusy(false);
    }
  };

  // Handle Undo Last Move
  const handleUndo = async () => {
    if (!gameState.canUndo || isGameBusy || isAiThinking) return;

    sound.playUndo();
    try {
      setIsGameBusy(true);
      const updatedState = await gameApi.undo(gameState.gameId);
      const sb = await gameApi.getScoreboard();
      setGameState(updatedState);
      setScoreboard(sb);
      showNotification('Move undone successfully', 'success');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsGameBusy(false);
    }
  };

  // Handle Reset Game
  const handleResetGame = async () => {
    if (isGameBusy || isAiThinking) return;

    sound.playClick();
    try {
      setIsGameBusy(true);
      const resetState = await gameApi.resetGame(gameState.gameId);
      setGameState(resetState);
      showNotification('Game board reset. Ready for new match!', 'info');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsGameBusy(false);
    }
  };

  // Handle Mode Change
  const handleSelectMode = async (mode) => {
    if (mode === gameState.gameMode || isGameBusy || isAiThinking) return;

    sound.playClick();
    try {
      setIsGameBusy(true);
      const newGame = await gameApi.createGame(mode);
      setGameState(newGame);
      showNotification(
        mode === GAME_MODES.COMPUTER
          ? 'Switched to Play Against Computer'
          : 'Switched to Two Player Mode',
        'info'
      );
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsGameBusy(false);
    }
  };

  // Handle Reset Scoreboard
  const handleResetScoreboard = async () => {
    if (isGameBusy || isAiThinking) return;

    sound.playClick();
    try {
      setIsGameBusy(true);
      const newScoreboard = await gameApi.resetScoreboard();
      setScoreboard(newScoreboard);
      showNotification('Session scoreboard cleared', 'info');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsGameBusy(false);
    }
  };

  // Sound toggle
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playClick();
    }
  };

  return (
    <div className="app-container">
      {/* Background ambient lighting */}
      <div className="ambient-glow glow-cyan" />
      <div className="ambient-glow glow-magenta" />

      {/* Toast Notification */}
      {notification && (
        <aside
          className={`toast-notification toast-${notification.type}`}
          role="status"
          aria-live="polite"
        >
          <span>{notification.message}</span>
        </aside>
      )}

      <div className="main-content-wrapper">
        <Header
          gameMode={gameState.gameMode}
          onSelectMode={handleSelectMode}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          onOpenInfo={() => setIsInfoOpen(true)}
          isGameBusy={isGameBusy}
        />

        <Scoreboard
          scoreboard={scoreboard}
          gameMode={gameState.gameMode}
          onResetScoreboard={handleResetScoreboard}
          isGameBusy={isGameBusy}
        />

        <main className="game-layout">
          {/* Left Column: Board & Primary Controls */}
          <section className="board-section" aria-label="Game Board and Status">
            <GameStatus
              gameStatus={gameState.gameStatus}
              currentPlayer={gameState.currentPlayer}
              winner={gameState.winner}
              gameMode={gameState.gameMode}
              isAiThinking={isAiThinking}
            />

            <GameBoard
              board={gameState.board}
              winningCells={gameState.winningCells}
              gameStatus={gameState.gameStatus}
              currentPlayer={gameState.currentPlayer}
              isAiThinking={isAiThinking}
              onCellClick={handleCellClick}
              disabled={isGameBusy}
            />

            <GameControls
              canUndo={gameState.canUndo}
              onUndo={handleUndo}
              onResetGame={handleResetGame}
              gameMode={gameState.gameMode}
              isGameBusy={isGameBusy || isAiThinking}
            />
          </section>

          {/* Right Column: Move History Ledger */}
          <aside className="sidebar-section" aria-label="Game History">
            <MoveHistory moveHistory={gameState.moveHistory} />
          </aside>
        </main>

        <footer className="app-footer">
          <p>
            Tic Tac Toe • React REST Architecture • Designed for Technical Review & Panel Discussion
          </p>
        </footer>
      </div>

      <PanelReviewModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </div>
  );
}
