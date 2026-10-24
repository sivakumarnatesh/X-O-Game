import React from 'react';
import { Undo2, RotateCw, CheckCircle2 } from 'lucide-react';
import { GAME_MODES } from '../services/gameEngine';

export function GameControls({
  canUndo,
  onUndo,
  onResetGame,
  gameMode,
  isGameBusy,
}) {
  const isComputerMode = gameMode === GAME_MODES.COMPUTER;
  const undoTooltip = !canUndo
    ? 'No moves available to undo'
    : isComputerMode
    ? 'Undo your move and the computer\'s response'
    : 'Undo the most recent move';

  return (
    <div className="game-controls">
      <div className="controls-buttons-group">
        {/* Undo Button */}
        <button
          type="button"
          id="btn-undo-move"
          data-testid="btn-undo-move"
          className={`control-btn btn-undo ${!canUndo ? 'btn-disabled' : ''}`}
          onClick={onUndo}
          disabled={!canUndo || isGameBusy}
          title={undoTooltip}
          aria-label={undoTooltip}
        >
          <Undo2 size={18} />
          <div className="btn-text-block">
            <span className="btn-main-text">Undo Move</span>
            <span className="btn-sub-text">
              {isComputerMode ? 'Removes Player + AI move' : 'Removes last move'}
            </span>
          </div>
        </button>

        {/* Reset Game Button */}
        <button
          type="button"
          id="btn-reset-game"
          data-testid="btn-reset-game"
          className="control-btn btn-reset"
          onClick={onResetGame}
          disabled={isGameBusy}
          title="Reset board and move history, keep scoreboard unchanged"
          aria-label="Reset Game"
        >
          <RotateCw size={18} />
          <div className="btn-text-block">
            <span className="btn-main-text">Reset Game</span>
            <span className="btn-sub-text">Fresh board • Scores preserved</span>
          </div>
        </button>
      </div>

      <div className="controls-clarification-note">
        <CheckCircle2 size={13} className="check-icon" />
        <span>Option B active: Scoreboard adjusts automatically if a completed game is undone</span>
      </div>
    </div>
  );
}
