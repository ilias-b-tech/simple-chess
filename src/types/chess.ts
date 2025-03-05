export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved?: boolean;
}

export interface Square {
  position: Position;
  piece: Piece | null;
  isHighlighted: boolean;
} 