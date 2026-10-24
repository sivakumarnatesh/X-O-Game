import React from 'react';
import { Volume2, VolumeX, Users, Bot, Info } from 'lucide-react';
import { GAME_MODES } from '../services/gameEngine';

export function Header({
  gameMode,
  onSelectMode,
  isMuted,
  onToggleSound,
  onOpenInfo,
  isGameBusy,
}) {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="logo-container">
          <div className="logo-icon-grid">
            <span className="logo-x">✕</span>
            <span className="logo-o">◯</span>
          </div>
          <div>
            <h1 className="app-title">TIC-TAC-TOE</h1>
            <p className="app-subtitle">React.js Edition • REST API Architecture</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            type="button"
            className="icon-btn info-btn"
            onClick={onOpenInfo}
            title="Panel Review & Specifications Guide"
            aria-label="Panel Review & Specifications Guide"
          >
            <Info size={18} />
            <span className="btn-label">Review Guide</span>
          </button>
        </div>
      </div>

      <div className="mode-selector-wrapper">
        <div className="mode-selector" role="radiogroup" aria-label="Game Mode">
          <button
            type="button"
            role="radio"
            aria-checked={gameMode === GAME_MODES.TWO_PLAYER}
            className={`mode-btn ${gameMode === GAME_MODES.TWO_PLAYER ? 'active' : ''}`}
            onClick={() => onSelectMode(GAME_MODES.TWO_PLAYER)}
            disabled={isGameBusy}
          >
            <Users size={16} />
            <span>Two Player Mode</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={gameMode === GAME_MODES.COMPUTER}
            className={`mode-btn ${gameMode === GAME_MODES.COMPUTER ? 'active' : ''}`}
            onClick={() => onSelectMode(GAME_MODES.COMPUTER)}
            disabled={isGameBusy}
          >
            <Bot size={16} />
            <span>Play vs Computer</span>
          </button>
        </div>
      </div>
    </header>
  );
}
