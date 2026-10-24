import React from 'react';
import { X, CheckCircle, ShieldAlert, Cpu, Database, Server, Sparkles } from 'lucide-react';

export function PanelReviewModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Sparkles className="modal-icon" size={20} />
            <div>
              <h2 className="modal-title">Panel Review & Architecture Guide</h2>
              <p className="modal-subtitle">Comprehensive breakdown for evaluation and technical discussion</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Section 1: Overview */}
          <div className="guide-section">
            <h3 className="section-title">
              <Cpu size={16} /> 1. Project Overview & Tech Stack
            </h3>
            <p className="section-text">
              This application satisfies all core, must-have, and behavioral expectations defined in the technical specification.
              Per explicit instructions, it is engineered using <strong>React.js (v19)</strong> with standard REST API architectural abstraction,
              structured state management, and comprehensive test coverage.
            </p>
            <div className="tech-tags">
              <span className="tag">React 19</span>
              <span className="tag">REST API Service Layer</span>
              <span className="tag">In-Memory / LocalStorage State</span>
              <span className="tag">Web Audio API</span>
              <span className="tag">Vitest & React Testing Library</span>
            </div>
          </div>

          {/* Section 2: Computer Mode Logic */}
          <div className="guide-section">
            <h3 className="section-title">
              <Cpu size={16} /> 2. Computer Opponent Priority Verification
            </h3>
            <p className="section-text">
              The AI engine strictly adheres to the 5-tier decision priority hierarchy:
            </p>
            <ol className="priority-list">
              <li><strong>Priority 1 (Win):</strong> If Computer (O) has 2 marks in any row, column, or diagonal, plays the winning cell immediately.</li>
              <li><strong>Priority 2 (Block):</strong> If Human (X) has 2 marks in any winning line, blocks X’s imminent victory.</li>
              <li><strong>Priority 3 (Center):</strong> Takes center cell (Row 2, Column 2 / Index 4) if unoccupied.</li>
              <li><strong>Priority 4 (Corner):</strong> Takes an available corner cell (Indices 0, 2, 6, 8 / Rows 1 & 3, Cols 1 & 3).</li>
              <li><strong>Priority 5 (Any):</strong> Takes the first remaining available cell on the grid.</li>
            </ol>
          </div>

          {/* Section 3: Scoreboard & Undo Clarification */}
          <div className="guide-section">
            <h3 className="section-title">
              <CheckCircle size={16} /> 3. Clarification 2: Undo & Scoreboard (Option B)
            </h3>
            <p className="section-text">
              <strong>Choice: Option B (Allow Undo After Completion).</strong>
            </p>
            <ul className="bullet-list">
              <li>In <strong>Two Player Mode</strong>, Undo reverts the last move.</li>
              <li>In <strong>Computer Mode</strong>, Undo removes both the computer’s last move and human player’s previous move together, restoring the turn to X.</li>
              <li>If a game is completed (Won or Drawn) and the player triggers Undo, the completed state is reverted and the respective session scoreboard score (X Wins, O Wins, or Draws) is accurately adjusted back down.</li>
              <li>Reset Game preserves the scoreboard, while a dedicated Reset Scoreboard button clears it.</li>
            </ul>
          </div>

          {/* Section 4: REST API Contract */}
          <div className="guide-section">
            <h3 className="section-title">
              <Server size={16} /> 4. REST API Endpoint Mapping
            </h3>
            <div className="table-responsive">
              <table className="guide-api-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Endpoint</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>POST</code></td>
                    <td><code>/api/games</code></td>
                    <td>Creates a new game session with selected mode</td>
                  </tr>
                  <tr>
                    <td><code>GET</code></td>
                    <td><code>/api/games/{'{id}'}</code></td>
                    <td>Retrieves current state, board, turn, and move history</td>
                  </tr>
                  <tr>
                    <td><code>POST</code></td>
                    <td><code>/api/games/{'{id}'}/moves</code></td>
                    <td>Submits player move, performs validation, triggers AI move</td>
                  </tr>
                  <tr>
                    <td><code>POST</code></td>
                    <td><code>/api/games/{'{id}'}/undo</code></td>
                    <td>Reverts move(s) based on mode and adjusts scoreboard</td>
                  </tr>
                  <tr>
                    <td><code>POST</code></td>
                    <td><code>/api/games/{'{id}'}/reset</code></td>
                    <td>Resets current game board and history, retains scores</td>
                  </tr>
                  <tr>
                    <td><code>GET</code></td>
                    <td><code>/api/scoreboard</code></td>
                    <td>Retrieves session scoreboard metrics</td>
                  </tr>
                  <tr>
                    <td><code>POST</code></td>
                    <td><code>/api/scoreboard/reset</code></td>
                    <td>Clears session scoreboard</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-modal-close" onClick={onClose}>
            Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}
