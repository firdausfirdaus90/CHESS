// Chess piece types
export const PIECES = {
  PAWN: 'pawn',
  ROOK: 'rook',
  KNIGHT: 'knight',
  BISHOP: 'bishop',
  QUEEN: 'queen',
  KING: 'king'
};

export const COLORS = {
  WHITE: 'white',
  BLACK: 'black'
};

// Initialize chess board
export const initializeBoard = () => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Place pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: PIECES.PAWN, color: COLORS.BLACK };
    board[6][i] = { type: PIECES.PAWN, color: COLORS.WHITE };
  }

  // Place other pieces
  const backRow = [
    PIECES.ROOK, PIECES.KNIGHT, PIECES.BISHOP, PIECES.QUEEN,
    PIECES.KING, PIECES.BISHOP, PIECES.KNIGHT, PIECES.ROOK
  ];

  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: backRow[i], color: COLORS.BLACK };
    board[7][i] = { type: backRow[i], color: COLORS.WHITE };
  }

  return board;
};

// Get piece at position
export const getPieceAt = (board, row, col) => {
  if (row < 0 || row > 7 || col < 0 || col > 7) return null;
  return board[row][col];
};

// Check if position is on board
export const isValidPosition = (row, col) => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

// Get all possible moves for a piece (without checking for check)
export const getPossibleMoves = (board, fromRow, fromCol) => {
  const piece = getPieceAt(board, fromRow, fromCol);
  if (!piece) return [];

  const moves = [];

  switch (piece.type) {
    case PIECES.PAWN:
      moves.push(...getPawnMoves(board, fromRow, fromCol, piece.color));
      break;
    case PIECES.ROOK:
      moves.push(...getRookMoves(board, fromRow, fromCol, piece.color));
      break;
    case PIECES.KNIGHT:
      moves.push(...getKnightMoves(board, fromRow, fromCol, piece.color));
      break;
    case PIECES.BISHOP:
      moves.push(...getBishopMoves(board, fromRow, fromCol, piece.color));
      break;
    case PIECES.QUEEN:
      moves.push(...getQueenMoves(board, fromRow, fromCol, piece.color));
      break;
    case PIECES.KING:
      moves.push(...getKingMoves(board, fromRow, fromCol, piece.color));
      break;
  }

  return moves;
};

// Pawn moves
const getPawnMoves = (board, row, col, color) => {
  const moves = [];
  const direction = color === COLORS.WHITE ? -1 : 1;
  const startRow = color === COLORS.WHITE ? 6 : 1;

  // Move forward one square
  if (!getPieceAt(board, row + direction, col)) {
    moves.push({ row: row + direction, col });

    // Move forward two squares from starting position
    if (row === startRow && !getPieceAt(board, row + 2 * direction, col)) {
      moves.push({ row: row + 2 * direction, col });
    }
  }

  // Capture diagonally
  [-1, 1].forEach(offset => {
    const targetPiece = getPieceAt(board, row + direction, col + offset);
    if (targetPiece && targetPiece.color !== color) {
      moves.push({ row: row + direction, col: col + offset });
    }
  });

  return moves;
};

// Rook moves
const getRookMoves = (board, row, col, color) => {
  return getSlidingMoves(board, row, col, color, [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ]);
};

// Bishop moves
const getBishopMoves = (board, row, col, color) => {
  return getSlidingMoves(board, row, col, color, [
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ]);
};

// Queen moves
const getQueenMoves = (board, row, col, color) => {
  return getSlidingMoves(board, row, col, color, [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ]);
};

// Sliding pieces (rook, bishop, queen)
const getSlidingMoves = (board, row, col, color, directions) => {
  const moves = [];

  directions.forEach(([dRow, dCol]) => {
    let newRow = row + dRow;
    let newCol = col + dCol;

    while (isValidPosition(newRow, newCol)) {
      const targetPiece = getPieceAt(board, newRow, newCol);

      if (!targetPiece) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (targetPiece.color !== color) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }

      newRow += dRow;
      newCol += dCol;
    }
  });

  return moves;
};

// Knight moves
const getKnightMoves = (board, row, col, color) => {
  const moves = [];
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  offsets.forEach(([dRow, dCol]) => {
    const newRow = row + dRow;
    const newCol = col + dCol;

    if (isValidPosition(newRow, newCol)) {
      const targetPiece = getPieceAt(board, newRow, newCol);
      if (!targetPiece || targetPiece.color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  });

  return moves;
};

// King moves
const getKingMoves = (board, row, col, color) => {
  const moves = [];
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  offsets.forEach(([dRow, dCol]) => {
    const newRow = row + dRow;
    const newCol = col + dCol;

    if (isValidPosition(newRow, newCol)) {
      const targetPiece = getPieceAt(board, newRow, newCol);
      if (!targetPiece || targetPiece.color !== color) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  });

  return moves;
};

// Find king position
export const findKing = (board, color) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === PIECES.KING && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

// Check if a position is under attack
export const isPositionUnderAttack = (board, row, col, byColor) => {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === byColor) {
        const moves = getPossibleMoves(board, r, c);
        if (moves.some(move => move.row === row && move.col === col)) {
          return true;
        }
      }
    }
  }
  return false;
};

// Check if king is in check
export const isInCheck = (board, color) => {
  const king = findKing(board, color);
  if (!king) return false;

  const opponentColor = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
  return isPositionUnderAttack(board, king.row, king.col, opponentColor);
};

// Make a move on the board
export const makeMove = (board, fromRow, fromCol, toRow, toCol) => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[fromRow][fromCol];

  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;

  // Handle pawn promotion
  if (piece.type === PIECES.PAWN) {
    if ((piece.color === COLORS.WHITE && toRow === 0) ||
        (piece.color === COLORS.BLACK && toRow === 7)) {
      newBoard[toRow][toCol] = { type: PIECES.QUEEN, color: piece.color };
    }
  }

  return newBoard;
};

// Check if move is valid (doesn't leave king in check)
export const isValidMove = (board, fromRow, fromCol, toRow, toCol) => {
  const piece = getPieceAt(board, fromRow, fromCol);
  if (!piece) return false;

  // Check if move is in possible moves
  const possibleMoves = getPossibleMoves(board, fromRow, fromCol);
  const moveExists = possibleMoves.some(move => move.row === toRow && move.col === toCol);
  if (!moveExists) return false;

  // Make the move temporarily
  const newBoard = makeMove(board, fromRow, fromCol, toRow, toCol);

  // Check if this move leaves the king in check
  const inCheck = isInCheck(newBoard, piece.color);

  return !inCheck;
};

// Get all legal moves (considering check)
export const getLegalMoves = (board, fromRow, fromCol) => {
  const possibleMoves = getPossibleMoves(board, fromRow, fromCol);
  return possibleMoves.filter(move =>
    isValidMove(board, fromRow, fromCol, move.row, move.col)
  );
};

// Check if player has any legal moves
export const hasLegalMoves = (board, color) => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const legalMoves = getLegalMoves(board, row, col);
        if (legalMoves.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
};

// Check for checkmate
export const isCheckmate = (board, color) => {
  return isInCheck(board, color) && !hasLegalMoves(board, color);
};

// Check for stalemate
export const isStalemate = (board, color) => {
  return !isInCheck(board, color) && !hasLegalMoves(board, color);
};

// Get all pieces of a color
export const getAllPieces = (board, color) => {
  const pieces = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        pieces.push({ row, col, piece });
      }
    }
  }
  return pieces;
};

// Convert position to algebraic notation
export const toAlgebraic = (row, col) => {
  const files = 'abcdefgh';
  const ranks = '87654321';
  return files[col] + ranks[row];
};

// Evaluate board position (for AI)
export const evaluateBoard = (board) => {
  const pieceValues = {
    [PIECES.PAWN]: 100,
    [PIECES.KNIGHT]: 320,
    [PIECES.BISHOP]: 330,
    [PIECES.ROOK]: 500,
    [PIECES.QUEEN]: 900,
    [PIECES.KING]: 20000
  };

  let score = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = pieceValues[piece.type];
        score += piece.color === COLORS.WHITE ? value : -value;
      }
    }
  }

  return score;
};
