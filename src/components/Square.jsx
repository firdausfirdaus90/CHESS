import React from 'react';
import Piece from './Piece';
import './Square.css';

const Square = ({
  piece,
  isLight,
  isSelected,
  isValidMove,
  isInCheck,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  row,
  col
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    if (onDragOver) onDragOver(e);
  };

  const classList = [
    'square',
    isLight ? 'light' : 'dark',
    isSelected ? 'selected' : '',
    isValidMove ? 'valid-move' : '',
    isInCheck ? 'in-check' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classList}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDrop={onDrop}
      data-row={row}
      data-col={col}
    >
      {isValidMove && !piece && <div className="move-indicator" />}
      {isValidMove && piece && <div className="capture-indicator" />}
      {piece && (
        <div
          draggable
          onDragStart={onDragStart}
        >
          <Piece piece={piece} />
        </div>
      )}
    </div>
  );
};

export default Square;
