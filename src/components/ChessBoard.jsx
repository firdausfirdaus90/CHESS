import React, { useState, useEffect } from 'react';
import Square from './Square';
import {
  initializeBoard,
  getLegalMoves,
  makeMove,
  isInCheck,
  isCheckmate,
  isStalemate,
  findKing,
  COLORS,
  toAlgebraic
} from '../utils/chessLogic';
import { getBestMove } from '../ai/chessAI';
import { getClaudeMove } from '../services/claudeAI';
import './ChessBoard.css';

const ChessBoard = ({
  onMove,
  onGameOver,
  gameMode,
  aiType,
  aiDifficulty,
  currentPlayer,
  setCurrentPlayer,
  board,
  setBoard,
  moveHistory,
  setMoveHistory
}) => {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [kingInCheck, setKingInCheck] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    // Check for check, checkmate, or stalemate
    if (isInCheck(board, currentPlayer)) {
      const king = findKing(board, currentPlayer);
      setKingInCheck(king);

      if (isCheckmate(board, currentPlayer)) {
        const winner = currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        onGameOver('checkmate', winner);
      }
    } else {
      setKingInCheck(null);

      if (isStalemate(board, currentPlayer)) {
        onGameOver('stalemate', null);
      }
    }
  }, [board, currentPlayer, onGameOver]);

  useEffect(() => {
    // AI move
    if (gameMode === 'ai' && currentPlayer === COLORS.BLACK && !aiThinking) {
      setAiThinking(true);

      const makeAIMove = async () => {
        try {
          let aiMove;

          if (aiType === 'claude') {
            // Use Claude AI
            const moveHistoryStr = moveHistory.map((m, idx) =>
              `${Math.floor(idx / 2) + 1}. ${toAlgebraic(m.from.row, m.from.col)}-${toAlgebraic(m.to.row, m.to.col)}`
            );
            aiMove = await getClaudeMove(board, COLORS.BLACK, moveHistoryStr);
          } else {
            // Use Minimax AI
            await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
            aiMove = getBestMove(board, COLORS.BLACK, aiDifficulty);
          }

          if (aiMove) {
            handleMove(aiMove.from.row, aiMove.from.col, aiMove.to.row, aiMove.to.col);
          }
        } catch (error) {
          console.error('AI move error:', error);
          alert('AI failed to make a move. Using Minimax fallback.');
          // Fallback to minimax if Claude fails
          const fallbackMove = getBestMove(board, COLORS.BLACK, aiDifficulty);
          if (fallbackMove) {
            handleMove(fallbackMove.from.row, fallbackMove.from.col, fallbackMove.to.row, fallbackMove.to.col);
          }
        } finally {
          setAiThinking(false);
        }
      };

      makeAIMove();
    }
  }, [currentPlayer, gameMode, board, aiType, aiDifficulty, aiThinking]);

  const handleSquareClick = (row, col) => {
    if (gameMode === 'ai' && currentPlayer === COLORS.BLACK) {
      return; // Don't allow clicks during AI turn
    }

    const piece = board[row][col];

    // If a square is already selected
    if (selectedSquare) {
      // Try to move to the clicked square
      const isValid = validMoves.some(move => move.row === row && move.col === col);

      if (isValid) {
        handleMove(selectedSquare.row, selectedSquare.col, row, col);
      } else if (piece && piece.color === currentPlayer) {
        // Select a different piece
        selectSquare(row, col);
      } else {
        // Deselect
        setSelectedSquare(null);
        setValidMoves([]);
      }
    } else {
      // Select a piece
      if (piece && piece.color === currentPlayer) {
        selectSquare(row, col);
      }
    }
  };

  const selectSquare = (row, col) => {
    setSelectedSquare({ row, col });
    const moves = getLegalMoves(board, row, col);
    setValidMoves(moves);
  };

  const handleMove = (fromRow, fromCol, toRow, toCol) => {
    const newBoard = makeMove(board, fromRow, fromCol, toRow, toCol);
    const movedPiece = board[fromRow][fromCol];

    setBoard(newBoard);
    setMoveHistory([...moveHistory, { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol }, piece: movedPiece }]);
    setSelectedSquare(null);
    setValidMoves([]);
    setCurrentPlayer(currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE);

    if (onMove) {
      onMove({ fromRow, fromCol, toRow, toCol });
    }
  };

  const handleDragStart = (e, row, col) => {
    if (gameMode === 'ai' && currentPlayer === COLORS.BLACK) {
      e.preventDefault();
      return;
    }

    const piece = board[row][col];
    if (!piece || piece.color !== currentPlayer) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
    selectSquare(row, col);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, toRow, toCol) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    const { row: fromRow, col: fromCol } = JSON.parse(data);
    const isValid = validMoves.some(move => move.row === toRow && move.col === toCol);

    if (isValid) {
      handleMove(fromRow, fromCol, toRow, toCol);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  return (
    <div className="chess-board-container">
      <div className="chess-board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare?.row === rowIndex && selectedSquare?.col === colIndex;
              const isValidMove = validMoves.some(move => move.row === rowIndex && move.col === colIndex);
              const isInCheckSquare = kingInCheck?.row === rowIndex && kingInCheck?.col === colIndex;

              return (
                <Square
                  key={`${rowIndex}-${colIndex}`}
                  piece={piece}
                  isLight={isLight}
                  isSelected={isSelected}
                  isValidMove={isValidMove}
                  isInCheck={isInCheckSquare}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                  onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                  row={rowIndex}
                  col={colIndex}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="board-labels">
        <div className="files">
          {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(file => (
            <div key={file} className="file-label">{file}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
