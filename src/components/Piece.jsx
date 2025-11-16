import React from 'react';
import './Piece.css';

const PIECE_SYMBOLS = {
  white: {
    pawn: '♙',
    rook: '♖',
    knight: '♘',
    bishop: '♗',
    queen: '♕',
    king: '♔'
  },
  black: {
    pawn: '♟',
    rook: '♜',
    knight: '♞',
    bishop: '♝',
    queen: '♛',
    king: '♚'
  }
};

const Piece = ({ piece, isDragging }) => {
  if (!piece) return null;

  const symbol = PIECE_SYMBOLS[piece.color][piece.type];

  return (
    <div className={`piece ${piece.color} ${isDragging ? 'dragging' : ''}`}>
      {symbol}
    </div>
  );
};

export default Piece;
