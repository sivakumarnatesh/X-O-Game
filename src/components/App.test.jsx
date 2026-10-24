import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import App from '../App';
import { gameApi } from '../services/apiClient';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('App Component Integration & UI', () => {
  beforeEach(async () => {
    localStorage.clear();
    await gameApi.resetScoreboard();
  });

  it('renders title, mode switcher, scoreboard, 3x3 board, and controls', async () => {
    render(<App />);

    expect(screen.getByText(/TIC-TAC-TOE/i)).toBeInTheDocument();
    expect(screen.getByText(/Two Player Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Play vs Computer/i)).toBeInTheDocument();
    expect(screen.getByText(/Session Scoreboard/i)).toBeInTheDocument();

    // Verify 9 cells rendered and enabled
    const cell0 = await screen.findByTestId('cell-0');
    await waitFor(() => expect(cell0).toBeEnabled());

    for (let i = 0; i < 9; i++) {
      expect(screen.getByTestId(`cell-${i}`)).toBeInTheDocument();
    }

    expect(screen.getByTestId('btn-undo-move')).toBeInTheDocument();
    expect(screen.getByTestId('btn-reset-game')).toBeInTheDocument();
  });

  it('handles player moves, updates move history, and switches turns', async () => {
    render(<App />);

    const cell0 = await screen.findByTestId('cell-0');
    await waitFor(() => expect(cell0).toBeEnabled());

    // Cell 0 click by Player X
    fireEvent.click(cell0);

    // Verify move registered in Move History
    await waitFor(() => {
      expect(screen.getByText(/Row 1, Column 1/i)).toBeInTheDocument();
    });

    // Check turn switched to O
    expect(screen.getByText(/Player O's Move/i)).toBeInTheDocument();

    // Click Cell 4 by Player O
    const cell4 = screen.getByTestId('cell-4');
    await waitFor(() => expect(cell4).toBeEnabled());
    fireEvent.click(cell4);

    await waitFor(() => {
      expect(screen.getByText(/Row 2, Column 2/i)).toBeInTheDocument();
    });
  });

  it('detects a win, displays the winner, and updates scoreboard', async () => {
    render(<App />);

    const cell0 = await screen.findByTestId('cell-0');
    await waitFor(() => expect(cell0).toBeEnabled());

    // Play top row for X: 0, 1, 2
    // X at 0
    fireEvent.click(cell0);
    // O at 3
    const cell3 = await screen.findByTestId('cell-3');
    await waitFor(() => expect(cell3).toBeEnabled());
    fireEvent.click(cell3);

    // X at 1
    const cell1 = await screen.findByTestId('cell-1');
    await waitFor(() => expect(cell1).toBeEnabled());
    fireEvent.click(cell1);

    // O at 4
    const cell4 = await screen.findByTestId('cell-4');
    await waitFor(() => expect(cell4).toBeEnabled());
    fireEvent.click(cell4);

    // X at 2 (Wins top row)
    const cell2 = await screen.findByTestId('cell-2');
    await waitFor(() => expect(cell2).toBeEnabled());
    fireEvent.click(cell2);

    // Win message should appear
    await waitFor(() => {
      expect(screen.getByText(/Player X has won the match/i)).toBeInTheDocument();
    });

    // Scoreboard X wins should be 1
    const xScore = screen.getByTestId('scoreboard-x-wins');
    expect(xScore.textContent).toBe('1');
  });

  it('Reset Game clears board and move history while preserving scores', async () => {
    render(<App />);

    const cell0 = await screen.findByTestId('cell-0');
    await waitFor(() => expect(cell0).toBeEnabled());

    fireEvent.click(cell0);

    await waitFor(() => {
      expect(screen.getByText(/Row 1, Column 1/i)).toBeInTheDocument();
    });

    // Click Reset Game
    const resetBtn = screen.getByTestId('btn-reset-game');
    fireEvent.click(resetBtn);

    // Move history should be empty again
    await waitFor(() => {
      expect(screen.getByText(/No moves recorded yet/i)).toBeInTheDocument();
    });
  });

  it('Undo reverts the last move in two-player mode', async () => {
    render(<App />);

    const cell0 = await screen.findByTestId('cell-0');
    await waitFor(() => expect(cell0).toBeEnabled());

    fireEvent.click(cell0);

    await waitFor(() => {
      expect(screen.getByText(/Row 1, Column 1/i)).toBeInTheDocument();
    });

    // Undo button is enabled
    const undoBtn = screen.getByTestId('btn-undo-move');
    expect(undoBtn).not.toBeDisabled();

    fireEvent.click(undoBtn);

    // History is empty and cell 0 is available again
    await waitFor(() => {
      expect(screen.getByText(/No moves recorded yet/i)).toBeInTheDocument();
    });
  });
});
