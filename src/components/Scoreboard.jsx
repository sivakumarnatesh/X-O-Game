import React, { useState } from 'react';
import { RotateCcw, Trophy, Award, MinusCircle } from 'lucide-react';
import { GAME_MODES } from '../services/gameEngine';

export function Scoreboard({
  scoreboard,
  gameMode,
  onResetScoreboard,
  isGameBusy,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleResetClick = () => {
    if (showConfirm) {
      onResetScoreboard();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 4000);
    }
  };

  const oPlayerLabel = gameMode === GAME_MODES.COMPUTER ? 'Computer (O)' : 'Player O';

  return (
    <section className="scoreboard-card" aria-label="Session Scoreboard">
      <div className="scoreboard-header">
        <div className="scoreboard-title-group">
          <Trophy size={18} className="trophy-icon" />
          <h2 className="scoreboard-title">Session Scoreboard</h2>
        </div>

        <button
          type="button"
          className={`btn-reset-scoreboard ${showConfirm ? 'confirming' : ''}`}
          onClick={handleResetClick}
          disabled={isGameBusy}
          title={showConfirm ? 'Click again to confirm reset' : 'Reset session scoreboard'}
          aria-label={showConfirm ? 'Click again to confirm reset' : 'Reset session scoreboard'}
        >
          <RotateCcw size={13} />
          <span>{showConfirm ? 'Confirm Reset?' : 'Reset Scores'}</span>
        </button>
      </div>

      <div className="scoreboard-grid">
        {/* Player X */}
        <div className="score-box score-x">
          <div className="score-badge">
            <span className="badge-symbol">✕</span>
            <span className="badge-name">Player X</span>
          </div>
          <div className="score-value" data-testid="scoreboard-x-wins">
            {scoreboard.xWins}
          </div>
          <div className="score-subtext">Victories</div>
        </div>

        {/* Draws */}
        <div className="score-box score-draws">
          <div className="score-badge">
            <MinusCircle size={14} />
            <span className="badge-name">Draws</span>
          </div>
          <div className="score-value" data-testid="scoreboard-draws">
            {scoreboard.draws}
          </div>
          <div className="score-subtext">Tied Matches</div>
        </div>

        {/* Player O */}
        <div className="score-box score-o">
          <div className="score-badge">
            <span className="badge-symbol">◯</span>
            <span className="badge-name">{oPlayerLabel}</span>
          </div>
          <div className="score-value" data-testid="scoreboard-o-wins">
            {scoreboard.oWins}
          </div>
          <div className="score-subtext">Victories</div>
        </div>
      </div>
    </section>
  );
}
