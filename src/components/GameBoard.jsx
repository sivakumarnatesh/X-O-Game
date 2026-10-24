import React from 'react';
import { PLAYERS, GAME_STATUS, indexToCoordinates } from '../services/gameEngine';

export function GameBoard({
  board,
  winningCells,
  gameStatus,
  onCellClick,
  currentPlayer,
  isAiThinking,
  disabled,
}) {
  const isGameOver = gameStatus !== GAME_STATUS.IN_PROGRESS;

  return (
    <div className="board-container">
      <div
        className={`game-board ${isGameOver ? 'game-over' : ''} ${isAiThinking ? 'ai-turn' : ''}`}
        role="grid"
        aria-label="Tic Tac Toe Board"
      >
        {board.map((cellValue, index) => {
          const isWinningCell = winningCells?.includes(index);
          const isOccupied = cellValue !== null && cellValue !== '';
          const isClickable = !isOccupied && !isGameOver && !isAiThinking && !disabled;
          const { row, column, position } = indexToCoordinates(index);

          const cellAriaLabel = isOccupied
            ? `${position}, occupied by ${cellValue}`
            : isClickable
            ? `${position}, empty, click to play ${currentPlayer}`
            : `${position}, empty`;

          return (
            <button
              key={index}
              type="button"
              id={`cell-${index}`}
              data-testid={`cell-${index}`}
              data-index={index}
              data-row={row}
              data-col={column}
              role="gridcell"
              aria-label={cellAriaLabel}
              disabled={!isClickable}
              onClick={() => isClickable && onCellClick(index)}
              className={`board-cell ${cellValue ? `cell-${cellValue.toLowerCase()}` : 'cell-empty'} ${
                isWinningCell ? 'cell-winning' : ''
              } ${!isClickable ? 'cell-locked' : 'cell-interactive'}`}
            >
              {cellValue === PLAYERS.X && (
                <svg className="mark mark-x" viewBox="0 0 100 100" aria-hidden="true">
                  <line x1="22" y1="22" x2="78" y2="78" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
                  <line x1="78" y1="22" x2="22" y2="78" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
                </svg>
              )}

              {cellValue === PLAYERS.O && (
                <svg className="mark mark-o" viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="14" fill="none" strokeLinecap="round" />
                </svg>
              )}

              {!cellValue && isClickable && (
                <span className="cell-hover-ghost">
                  {currentPlayer === PLAYERS.X ? '✕' : '◯'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
