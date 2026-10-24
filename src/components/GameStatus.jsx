import React from 'react';
import { Sparkles, Bot, AlertCircle } from 'lucide-react';
import { GAME_STATUS, GAME_MODES, PLAYERS } from '../services/gameEngine';

export function GameStatus({
  gameStatus,
  currentPlayer,
  winner,
  gameMode,
  isAiThinking,
}) {
  const isComputerMode = gameMode === GAME_MODES.COMPUTER;
  const isOComputer = isComputerMode && currentPlayer === PLAYERS.O;

  let bannerClass = 'status-in-progress';
  let bannerContent = null;

  if (gameStatus === GAME_STATUS.WON) {
    bannerClass = 'status-won';
    const isHumanWinner = winner === PLAYERS.X;
    const isAiWinner = isComputerMode && winner === PLAYERS.O;

    bannerContent = (
      <div className="status-message win-message">
        <Sparkles className="status-icon pulse-icon" size={24} />
        <div>
          <span className="status-lead">Winner!</span>
          <span className="status-highlight">
            {isAiWinner
              ? '🤖 Computer (O) takes the victory!'
              : isHumanWinner
              ? '🎉 Player X has won the match!'
              : '🎉 Player O has won the match!'}
          </span>
        </div>
      </div>
    );
  } else if (gameStatus === GAME_STATUS.DRAW) {
    bannerClass = 'status-draw';
    bannerContent = (
      <div className="status-message draw-message">
        <AlertCircle className="status-icon" size={24} />
        <div>
          <span className="status-lead">Game Drawn!</span>
          <span className="status-highlight">All cells filled with no winner. Well played!</span>
        </div>
      </div>
    );
  } else {
    // In Progress
    if (isAiThinking) {
      bannerClass = 'status-ai-thinking';
      bannerContent = (
        <div className="status-message thinking-message">
          <Bot className="status-icon spin-slow" size={22} />
          <div>
            <span className="status-lead">Computer is thinking...</span>
            <span className="status-highlight">Evaluating optimal move based on priority rules</span>
          </div>
        </div>
      );
    } else {
      bannerClass = `status-turn turn-${currentPlayer.toLowerCase()}`;
      bannerContent = (
        <div className="status-message turn-message">
          <div className={`player-turn-indicator indicator-${currentPlayer.toLowerCase()}`}>
            {currentPlayer === PLAYERS.X ? '✕' : '◯'}
          </div>
          <div>
            <span className="status-lead">Current Turn</span>
            <span className="status-highlight">
              {currentPlayer === PLAYERS.X
                ? 'Player X'
                : isComputerMode
                ? 'Computer (O)'
                : 'Player O'}
              's Move
            </span>
          </div>
        </div>
      );
    }
  }

  return (
    <div className={`game-status-banner ${bannerClass}`} role="status" aria-live="polite">
      {bannerContent}
    </div>
  );
}
