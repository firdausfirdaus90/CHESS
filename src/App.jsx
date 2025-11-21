import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ChessBoard from './components/ChessBoard';
import { initializeBoard, COLORS, toAlgebraic, PIECES } from './utils/chessLogic';
import { saveGameResult } from './services/gameHistory';
import { useAuth } from './contexts/AuthContext';
import './App.css';

const App = () => {
  const [board, setBoard] = useState(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState(COLORS.WHITE);
  const [gameMode, setGameMode] = useState('local'); // 'local' or 'ai'
  const [aiType, setAiType] = useState('minimax'); // 'minimax' or 'claude'
  const [aiDifficulty, setAiDifficulty] = useState('medium');
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameStatus, setGameStatus] = useState('active');
  const [winner, setWinner] = useState(null);
  const [theme, setTheme] = useState('light');
  const [whiteTime, setWhiteTime] = useState(600); // 10 minutes in seconds
  const [blackTime, setBlackTime] = useState(600);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const gameStartTime = useRef(Date.now());
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Timer effect
  useEffect(() => {
    if (!timerEnabled || gameStatus !== 'active') return;

    const interval = setInterval(() => {
      if (currentPlayer === COLORS.WHITE) {
        setWhiteTime(prev => {
          if (prev <= 0) {
            handleGameOver('timeout', COLORS.BLACK);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 0) {
            handleGameOver('timeout', COLORS.WHITE);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPlayer, timerEnabled, gameStatus]);

  // Load saved game on mount
  useEffect(() => {
    const savedGame = localStorage.getItem('chessGame');
    if (savedGame) {
      try {
        const data = JSON.parse(savedGame);
        // Could restore game state here if desired
      } catch (e) {
        console.error('Failed to load saved game:', e);
      }
    }
  }, []);

  const handleGameOver = useCallback(async (reason, winnerColor) => {
    setGameStatus(reason);
    setWinner(winnerColor);
    setTimerEnabled(false);

    // Save game result to Firestore
    try {
      const duration = Math.floor((Date.now() - gameStartTime.current) / 1000); // in seconds
      const gameData = {
        winner: reason === 'stalemate' ? 'draw' : winnerColor,
        gameMode: gameMode,
        aiType: gameMode === 'ai' ? aiType : null,
        aiDifficulty: gameMode === 'ai' ? aiDifficulty : null,
        moveCount: moveHistory.length,
        duration: duration
      };
      await saveGameResult(gameData);
      console.log('Game result saved successfully');
    } catch (error) {
      console.error('Failed to save game result:', error);
    }
  }, [gameMode, aiType, aiDifficulty, moveHistory]);

  const handleNewGame = () => {
    setBoard(initializeBoard());
    setCurrentPlayer(COLORS.WHITE);
    setMoveHistory([]);
    setGameStatus('active');
    setWinner(null);
    setWhiteTime(600);
    setBlackTime(600);
    gameStartTime.current = Date.now();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const handleUndo = () => {
    if (moveHistory.length === 0) return;

    const movesToUndo = gameMode === 'ai' ? 2 : 1; // Undo 2 moves in AI mode (player + AI)
    const newHistory = moveHistory.slice(0, -movesToUndo);

    // Rebuild board from history
    let newBoard = initializeBoard();
    let newPlayer = COLORS.WHITE;

    newHistory.forEach(move => {
      const { from, to } = move;
      const piece = newBoard[from.row][from.col];
      newBoard[to.row][to.col] = piece;
      newBoard[from.row][from.col] = null;

      // Handle pawn promotion
      if (piece.type === PIECES.PAWN) {
        if ((piece.color === COLORS.WHITE && to.row === 0) ||
            (piece.color === COLORS.BLACK && to.row === 7)) {
          newBoard[to.row][to.col] = { type: PIECES.QUEEN, color: piece.color };
        }
      }

      newPlayer = newPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    });

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setCurrentPlayer(newPlayer);
    setGameStatus('active');
    setWinner(null);
  };

  const handleSaveGame = () => {
    const gameData = {
      board,
      currentPlayer,
      moveHistory,
      gameMode,
      aiDifficulty,
      whiteTime,
      blackTime,
      timestamp: Date.now()
    };

    localStorage.setItem('chessGame', JSON.stringify(gameData));
    alert('Game saved successfully!');
  };

  const handleLoadGame = () => {
    const savedGame = localStorage.getItem('chessGame');
    if (!savedGame) {
      alert('No saved game found!');
      return;
    }

    try {
      const data = JSON.parse(savedGame);
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setMoveHistory(data.moveHistory || []);
      setGameMode(data.gameMode || 'local');
      setAiDifficulty(data.aiDifficulty || 'medium');
      setWhiteTime(data.whiteTime || 600);
      setBlackTime(data.blackTime || 600);
      setGameStatus('active');
      setWinner(null);
      alert('Game loaded successfully!');
    } catch (e) {
      alert('Failed to load game!');
      console.error(e);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMoveNotation = (move) => {
    const { from, to, piece } = move;
    const pieceSymbol = piece.type === PIECES.PAWN ? '' : piece.type[0].toUpperCase();
    return `${pieceSymbol}${toAlgebraic(from.row, from.col)}-${toAlgebraic(to.row, to.col)}`;
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>♟️ Chess Game</h1>
        <div className="header-actions">
          <Link to="/history" className="history-link">View History</Link>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="logout-button" onClick={handleLogout} title="Logout">
            Logout
          </button>
        </div>
      </header>

      <div className="game-container">
        <div className="side-panel">
          <div className="game-controls">
            <h3>Game Controls</h3>

            <div className="control-group">
              <label>Game Mode:</label>
              <select value={gameMode} onChange={(e) => setGameMode(e.target.value)}>
                <option value="local">Local Multiplayer</option>
                <option value="ai">vs AI</option>
              </select>
            </div>

            {gameMode === 'ai' && (
              <>
                <div className="control-group">
                  <label>AI Type:</label>
                  <select value={aiType} onChange={(e) => setAiType(e.target.value)}>
                    <option value="minimax">Minimax (Free)</option>
                    <option value="claude">Claude AI (Smart)</option>
                  </select>
                </div>
                <div className="control-group">
                  <label>AI Difficulty:</label>
                  <select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </>
            )}

            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={timerEnabled}
                  onChange={(e) => setTimerEnabled(e.target.checked)}
                />
                Enable Timer
              </label>
            </div>

            <div className="button-group">
              <button onClick={handleNewGame}>New Game</button>
              <button onClick={handleUndo} disabled={moveHistory.length === 0}>
                Undo
              </button>
              <button onClick={handleSaveGame}>Save</button>
              <button onClick={handleLoadGame}>Load</button>
            </div>
          </div>

          {timerEnabled && (
            <div className="timer-display">
              <div className={`timer ${currentPlayer === COLORS.WHITE ? 'active' : ''}`}>
                <span className="timer-label">White:</span>
                <span className="timer-value">{formatTime(whiteTime)}</span>
              </div>
              <div className={`timer ${currentPlayer === COLORS.BLACK ? 'active' : ''}`}>
                <span className="timer-label">Black:</span>
                <span className="timer-value">{formatTime(blackTime)}</span>
              </div>
            </div>
          )}

          <div className="game-info">
            <h3>Game Status</h3>
            <div className="status-text">
              {gameStatus === 'active' && (
                <p>Current turn: <strong>{currentPlayer}</strong></p>
              )}
              {gameStatus === 'checkmate' && (
                <p className="game-over">Checkmate! <strong>{winner}</strong> wins!</p>
              )}
              {gameStatus === 'stalemate' && (
                <p className="game-over">Stalemate! It's a draw.</p>
              )}
              {gameStatus === 'timeout' && (
                <p className="game-over">Time's up! <strong>{winner}</strong> wins!</p>
              )}
            </div>
          </div>

          <div className="move-history">
            <h3>Move History</h3>
            <div className="moves-list">
              {moveHistory.length === 0 ? (
                <p className="no-moves">No moves yet</p>
              ) : (
                moveHistory.map((move, index) => (
                  <div key={index} className="move-item">
                    <span className="move-number">{Math.floor(index / 2) + 1}.</span>
                    <span className={`move-notation ${index % 2 === 0 ? 'white-move' : 'black-move'}`}>
                      {getMoveNotation(move)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="board-container">
          <ChessBoard
            onMove={() => {}}
            onGameOver={handleGameOver}
            gameMode={gameMode}
            aiType={aiType}
            aiDifficulty={aiDifficulty}
            currentPlayer={currentPlayer}
            setCurrentPlayer={setCurrentPlayer}
            board={board}
            setBoard={setBoard}
            moveHistory={moveHistory}
            setMoveHistory={setMoveHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
