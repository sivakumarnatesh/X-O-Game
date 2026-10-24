# Tic-Tac-Toe • React.js Edition & REST API Architecture

A high-performance, modern browser-based **Tic-Tac-Toe** application built with **React.js** featuring a modular **REST API Client Service Architecture**, session-level scoreboard, move history ledger, multi-mode undo engine, and a 5-tier heuristic computer opponent.

Designed specifically for technical panel review, live demonstration, and code inspection.

---

## 1. Project Overview

This project implements the comprehensive functional and non-functional requirements specified in the coding assessment:
- Standard 3 × 3 interactive game board with locked cell states and turn alternation.
- Full row, column, and diagonal win detection with golden victory highlights and celebration confetti.
- Full draw detection when 9 cells are filled with no winner.
- Real-time move history ledger tracking move numbers, players (X/O), and 1-indexed coordinates (e.g. `Row 1, Column 1`).
- Multi-mode **Undo Last Move**:
  - In **Two Player Mode**, reverts only the most recent move.
  - In **Computer Mode**, reverts the computer's countermove and the human player's move together.
  - Full support for **Option B** (score adjustment upon undoing a finished game).
- Built-in session scoreboard tracking X Wins, O Wins, and Draws.
- Intelligent computer opponent following strict 5-tier strategic priorities.
- Pure Web Audio API sound synthesizer for responsive auditory feedback without external audio file dependencies.

---

## 2. Tech Stack

- **Frontend Framework:** React 19 (`react`, `react-dom`)
- **Build Tool & Dev Server:** Vite 8 (Ultra-fast HMR and bundling)
- **Styling:** Vanilla CSS with custom Design Tokens, Obsidian Dark Palette, Glassmorphism (`backdrop-filter: blur(16px)`), and micro-animations
- **Icons:** Lucide React (`lucide-react`)
- **Visual FX:** Canvas Confetti (`canvas-confetti`)
- **Audio:** Native Web Audio API (Synthesizer for moves, wins, draws, undo, reset)
- **Testing Suite:** Vitest 5, JSDOM, `@testing-library/react`, `@testing-library/jest-dom`
- **Architecture Pattern:** Decoupled REST API Client Service Layer (`gameApi` & `GameSession`)

---

## 3. Features Implemented

| Requirement Area | Implementation Details |
| :--- | :--- |
| **Game Board** | 3 × 3 responsive grid, empty cells clickable, locked after move, SVG drawing animations for X and O |
| **Player Turns** | Clearly indicated current turn with glowing avatars, automatic turn alternation between X and O |
| **Win Detection** | 8-combination checks (3 rows, 3 columns, 2 diagonals); glowing golden highlights on winning cells |
| **Draw Detection** | 9 cells filled without winner; draw status banner and auditory chime |
| **Reset Game** | Restores fresh board and clears move history while preserving session scoreboard |
| **Move History** | Scrollable ledger with Move #, Player badge, Position coordinates (`Row R, Column C`), and auto-scroll |
| **Undo Last Move** | Two Player: undoes 1 move. Computer: undoes Human + AI move pair. Disabled when empty. |
| **Scoreboard** | Session-level tracking (X Wins, O Wins, Draws). Separate `Reset Scores` button with confirmation. |
| **Computer Opponent** | Automated countermove adhering strictly to the 5-tier priority hierarchy. |
| **Review Guide Modal** | In-app interactive documentation drawer for reviewers and interview panels. |

---

## 4. Backend Architecture & REST API Service

Per instructions: *"this is the requirement do this using ReactJS not required to .net backend only frontend is enough do this"*.

To satisfy both the frontend-only execution and the panel's review of the **.NET REST API expectations**, the application incorporates a **Decoupled REST Service Layer** (`src/services/apiClient.js` & `src/services/gameEngine.js`):

- The frontend interacts with `gameApi`, which mimics the exact HTTP REST API contract specified in the prompt.
- Session state, game rules, move validation, AI calculation, and scoreboard synchronization are owned by the service engine.
- **Switching to a live .NET Web API:** Swapping the mock client to a standard `fetch`/`axios` call pointing to `http://localhost:5000/api/...` requires changing only the client implementation without altering any React UI components!

---

## 5. How to Run Locally

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)

### Installation & Launch

```bash
# 1. Navigate to the project directory
cd /Users/sk/.gemini/antigravity-ide/scratch/tic-tac-toe-react

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

Open your browser at **`http://localhost:3000`** (or the URL shown in your terminal).

To create a production build:
```bash
npm run build
npm run preview
```

---

## 6. API Endpoint Summary

The service layer implements the suggested REST API contract:

| Method | Endpoint | Description | Request Payload | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/games` | Creates a new game session | `{ gameMode: 'TwoPlayer' \| 'PlayAgainstComputer' }` | Full `GameState` |
| `GET` | `/api/games/{id}` | Retrieves current state of a game | None | Full `GameState` |
| `POST` | `/api/games/{id}/moves` | Validates & submits a move | `{ player: 'X' \| 'O', cellIndex: 0-8 }` | Full `GameState` |
| `POST` | `/api/games/{id}/undo` | Reverts move(s) based on mode | None | Full `GameState` |
| `POST` | `/api/games/{id}/reset` | Resets current board & history | None | Full `GameState` |
| `GET` | `/api/scoreboard` | Retrieves session scoreboard | None | `{ xWins, oWins, draws, totalGames }` |
| `POST` | `/api/scoreboard/reset` | Resets session scoreboard to 0 | None | `{ xWins: 0, oWins: 0, draws: 0 }` |

### `GameState` Response Schema:
```json
{
  "gameId": "game-1792818000-abc12",
  "board": ["X", null, null, null, "O", null, null, null, null],
  "currentPlayer": "X",
  "gameMode": "PlayAgainstComputer",
  "gameStatus": "InProgress",
  "winner": null,
  "winningCells": null,
  "moveHistory": [
    {
      "moveNumber": 1,
      "player": "X",
      "cellIndex": 0,
      "row": 1,
      "column": 1,
      "position": "Row 1, Column 1",
      "timestamp": 1792818001000
    },
    {
      "moveNumber": 2,
      "player": "O",
      "cellIndex": 4,
      "row": 2,
      "column": 2,
      "position": "Row 2, Column 2",
      "timestamp": 1792818001300
    }
  ],
  "scoreboard": {
    "xWins": 1,
    "oWins": 0,
    "draws": 0,
    "totalGames": 1
  },
  "canUndo": true
}
```

---

## 7. How to Run Tests

The test suite covers:
1. **Valid move registration & coordinate transformation**
2. **Invalid move rejections:** occupied cell, wrong turn, out-of-bounds
3. **Turn switching**
4. **Row win detection & cell highlighting**
5. **Column win detection**
6. **Diagonal win detection**
7. **Draw detection on full board**
8. **Reset game state isolation**
9. **Undo in Two Player Mode** (removes 1 move)
10. **Undo in Computer Mode** (removes AI + Human move pair)
11. **Scoreboard updates & double-count prevention**
12. **Option B Scoreboard reversal on undo**
13. **Computer move selection priorities (1 through 5)**
14. **Move after game completion rejection**
15. **React Component integration & DOM interactions**

### Executing Tests:
```bash
# Run Vitest test suite once
npm test

# Run tests in watch mode
npx vitest
```

---

## 8. AI Tools & Prompt Summary

During development, AI-assisted pairing was leveraged for:
- Converting the dual-stack specification (.NET + Angular) into a clean, modern React.js architecture matching the user's explicit preference.
- Generating deterministic unit test matrices for edge cases (e.g., non-trivial board state proving Priority 5 heuristic).
- Generating CSS variables and tokens for obsidian glassmorphism.
- Synthesizing Web Audio oscillators without external asset downloads.

### Manual Engineering & Code Review:
- **State Invariant Verification:** Verified that reversing a finished game with Undo (Option B) decrements the scoreboard accurately without going negative.
- **Priority Logic Verification:** Rigorously tested `calculateComputerMove` against all 8 winning lines to guarantee that Priority 1 (Win) precedes Priority 2 (Block), and Priority 3 (Center) precedes Priority 4 (Corner).
- **Asynchronous Simulation:** Ensured that tests bypass artificial network latency while real user interactions benefit from subtle responsiveness cues.

---

## 9. Design Decisions

1. **Pure React + Vite over Heavy Frameworks:** Minimal overhead, instantaneous startup, zero configuration friction for panel evaluation.
2. **Web Audio API vs Audio Files:** Eliminates 404 errors, network latency, and external CDN dependencies; pure sine and triangle wave synthesis.
3. **Accessibility First:** Interactive cells feature dynamic ARIA labels (`aria-label="Row 1, Column 1, occupied by X"`), role definitions, and keyboard navigation.
4. **Option B Implementation:** Allows players to explore "what if" scenarios by undoing the winning move, with the scoreboard remaining consistent with the visible state.

---

## 10. Clarifications & Assumptions

- **Clarification 1 (State Ownership):** The state engine owns game logic, validation, status, and move history. The React UI acts strictly as a presentation layer.
- **Clarification 2 (Scoreboard & Undo Choice):** **Option B** was selected. If a finished game (Won or Drawn) is undone, the completed count for that result is decremented from the scoreboard.
- **Coordinates Assumption:** 1-indexed format (`Row 1, Column 1` through `Row 3, Column 3`) is displayed in the Move History ledger as requested in the specification.

---

## 11. Known Limitations

- In Computer Mode, the human player is always X and plays first. Support for selecting O as the human player can be added in future iterations.
- Sound requires user interaction before playing due to browser autoplay policies (handled automatically on first click).

---

## 12. Future Improvements

- Add selectable AI difficulty levels (Minimax unbeatable vs basic heuristic).
- Add remote backend configuration switch (`VITE_USE_DOTNET_API=true`).
- Add multiplayer room support using WebSockets / SignalR.
- Add theme switcher (Cyberpunk Neon, Clean Light Mode, Midnight Obsidian).
