import React, { useEffect, useRef } from 'react';
import { History, ArrowDown } from 'lucide-react';
import { PLAYERS } from '../services/gameEngine';

export function MoveHistory({ moveHistory }) {
  const scrollRef = useRef(null);

  // Auto-scroll to latest move when history updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory]);

  return (
    <div className="move-history-card" aria-label="Game Move History">
      <div className="history-header">
        <div className="history-title-group">
          <History size={16} />
          <h3 className="history-title">Move History</h3>
        </div>
        <span className="history-count-badge">
          {moveHistory.length} {moveHistory.length === 1 ? 'Move' : 'Moves'}
        </span>
      </div>

      <div className="history-table-container" ref={scrollRef}>
        {moveHistory.length === 0 ? (
          <div className="history-empty">
            <span className="empty-icon">🎮</span>
            <p className="empty-lead">No moves recorded yet</p>
            <p className="empty-sub">Make a move on the board to start tracking</p>
          </div>
        ) : (
          <table className="history-table" aria-label="Move Log">
            <thead>
              <tr>
                <th scope="col" className="col-num">Move</th>
                <th scope="col" className="col-player">Player</th>
                <th scope="col" className="col-pos">Position</th>
              </tr>
            </thead>
            <tbody>
              {moveHistory.map((move, index) => {
                const isLatest = index === moveHistory.length - 1;
                return (
                  <tr
                    key={`${move.moveNumber}-${move.cellIndex}-${move.timestamp || index}`}
                    className={`history-row ${isLatest ? 'row-latest' : ''}`}
                    data-testid={`history-row-${move.moveNumber}`}
                  >
                    <td className="col-num">
                      <span className="num-pill">{move.moveNumber}</span>
                    </td>
                    <td className="col-player">
                      <span className={`player-pill pill-${move.player.toLowerCase()}`}>
                        {move.player === PLAYERS.X ? '✕ X' : '◯ O'}
                      </span>
                    </td>
                    <td className="col-pos">
                      <span className="pos-text">{move.position}</span>
                      {isLatest && <span className="latest-indicator">Newest</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
