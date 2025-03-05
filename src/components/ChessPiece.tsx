import React from 'react';
import { Piece } from '../types/chess';

interface ChessPieceProps {
  piece: Piece;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece }) => {
  const getPieceSymbol = (piece: Piece): string => {
    const symbols = {
      white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
      },
      black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
      }
    };

    return symbols[piece.color][piece.type];
  };

  return (
    <div className={`chess-piece ${piece.color}`}>
      {getPieceSymbol(piece)}
    </div>
  );
};

export default ChessPiece; 