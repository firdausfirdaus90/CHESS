# Chess Game

A full-featured chess web application built with React and Vite.

## Features

- **Complete Chess Rules**: Full implementation of chess rules including move validation, check, checkmate, and stalemate detection
- **Drag-and-Drop Interface**: Intuitive piece movement with both click and drag-and-drop support
- **AI Opponent**: Play against an AI with three difficulty levels (Easy, Medium, Hard) using minimax algorithm with alpha-beta pruning
- **Local Multiplayer**: Play with a friend on the same device
- **Move History**: Track all moves made during the game
- **Undo Functionality**: Undo moves (automatically undoes both player and AI moves in AI mode)
- **Game Timer**: Optional chess clock with customizable time controls
- **Save/Load Games**: Save your game to local storage and continue later
- **Light/Dark Theme**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices
- **Pawn Promotion**: Pawns automatically promote to Queens when reaching the opposite end

## Technologies Used

- React 18
- Vite
- CSS3 with CSS Variables
- JavaScript ES6+

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd CHESS
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How to Play

1. **Starting a Game**:
   - Choose between Local Multiplayer or vs AI mode
   - Select AI difficulty if playing against computer
   - Optionally enable the game timer
   - Click "New Game" to start

2. **Making Moves**:
   - Click a piece to select it (legal moves will be highlighted)
   - Click a highlighted square to move
   - Or drag and drop pieces to move them

3. **Game Controls**:
   - **Undo**: Take back the last move(s)
   - **Save**: Save the current game state
   - **Load**: Load a previously saved game
   - **New Game**: Start a fresh game

4. **Winning the Game**:
   - Checkmate your opponent's king
   - Win on time if timer is enabled
   - The game can also end in a stalemate (draw)

## Project Structure

```
CHESS/
├── public/              # Static assets
├── src/
│   ├── ai/             # AI implementation
│   │   └── chessAI.js  # Minimax algorithm
│   ├── components/     # React components
│   │   ├── ChessBoard.jsx
│   │   ├── Square.jsx
│   │   └── Piece.jsx
│   ├── utils/          # Utility functions
│   │   └── chessLogic.js  # Chess game logic
│   ├── App.jsx         # Main app component
│   ├── App.css         # App styles
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies
```

## License

MIT

## Author

Built with Claude Code
