import {
  getAllPieces,
  getLegalMoves,
  makeMove,
  evaluateBoard,
  isCheckmate,
  isStalemate,
  COLORS
} from '../utils/chessLogic.js';

// Minimax algorithm with alpha-beta pruning
const minimax = (board, depth, alpha, beta, isMaximizing, aiColor) => {
  // Base cases
  if (depth === 0) {
    return evaluateBoard(board);
  }

  const currentColor = isMaximizing ? aiColor : (aiColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE);

  if (isCheckmate(board, currentColor)) {
    return isMaximizing ? -999999 : 999999;
  }

  if (isStalemate(board, currentColor)) {
    return 0;
  }

  const pieces = getAllPieces(board, currentColor);

  if (isMaximizing) {
    let maxEval = -Infinity;

    for (const { row, col } of pieces) {
      const moves = getLegalMoves(board, row, col);

      for (const move of moves) {
        const newBoard = makeMove(board, row, col, move.row, move.col);
        const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, aiColor);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);

        if (beta <= alpha) {
          break; // Beta cutoff
        }
      }

      if (beta <= alpha) {
        break;
      }
    }

    return maxEval;
  } else {
    let minEval = Infinity;

    for (const { row, col } of pieces) {
      const moves = getLegalMoves(board, row, col);

      for (const move of moves) {
        const newBoard = makeMove(board, row, col, move.row, move.col);
        const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, aiColor);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);

        if (beta <= alpha) {
          break; // Alpha cutoff
        }
      }

      if (beta <= alpha) {
        break;
      }
    }

    return minEval;
  }
};

// Get best move for AI
export const getBestMove = (board, color, difficulty = 'medium') => {
  const depthMap = {
    'easy': 1,
    'medium': 2,
    'hard': 3
  };

  const depth = depthMap[difficulty] || 2;

  let bestMove = null;
  let bestValue = -Infinity;

  const pieces = getAllPieces(board, color);

  // Shuffle pieces for variety
  const shuffledPieces = pieces.sort(() => Math.random() - 0.5);

  for (const { row, col } of shuffledPieces) {
    const moves = getLegalMoves(board, row, col);

    for (const move of moves) {
      const newBoard = makeMove(board, row, col, move.row, move.col);
      const boardValue = minimax(newBoard, depth - 1, -Infinity, Infinity, false, color);

      if (boardValue > bestValue) {
        bestValue = boardValue;
        bestMove = {
          from: { row, col },
          to: { row: move.row, col: move.col }
        };
      }
    }
  }

  return bestMove;
};

// Get random move (for easier difficulty)
export const getRandomMove = (board, color) => {
  const pieces = getAllPieces(board, color);
  const shuffledPieces = pieces.sort(() => Math.random() - 0.5);

  for (const { row, col } of shuffledPieces) {
    const moves = getLegalMoves(board, row, col);

    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return {
        from: { row, col },
        to: { row: randomMove.row, col: randomMove.col }
      };
    }
  }

  return null;
};
