import { Piece, Position, PieceType, PieceColor } from '../types/chess';

export const initialBoardSetup = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black', position: { x: i, y: 1 }, hasMoved: false };
    board[6][i] = { type: 'pawn', color: 'white', position: { x: i, y: 6 }, hasMoved: false };
  }

  // Set up other pieces
  const setupPieces = (row: number, color: PieceColor) => {
    const pieces: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    pieces.forEach((type, col) => {
      board[row][col] = { type, color, position: { x: col, y: row }, hasMoved: false };
    });
  };

  setupPieces(0, 'black');
  setupPieces(7, 'white');

  return board;
};

const isPathClear = (
  fromPos: Position,
  toPos: Position,
  board: (Piece | null)[][],
  isDiagonal: boolean
): boolean => {
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  
  // Determine direction
  const xStep = dx === 0 ? 0 : dx > 0 ? 1 : -1;
  const yStep = dy === 0 ? 0 : dy > 0 ? 1 : -1;
  
  let currentX = fromPos.x + xStep;
  let currentY = fromPos.y + yStep;
  
  // Check each square in the path
  while (isDiagonal ? 
    (currentX !== toPos.x && currentY !== toPos.y) : 
    (currentX !== toPos.x || currentY !== toPos.y)) {
    
    if (board[currentY][currentX] !== null) {
      return false; // Path is blocked
    }
    
    currentX += xStep;
    currentY += yStep;
  }
  
  return true;
};

const findKing = (board: (Piece | null)[][], color: PieceColor): Position | null => {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece?.type === 'king' && piece.color === color) {
        return { x, y };
      }
    }
  }
  return null;
};

const isSquareUnderAttack = (
  position: Position,
  attackingColor: PieceColor,
  board: (Piece | null)[][],
): boolean => {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.color === attackingColor) {
        // Temporarily remove the target square piece to check if it's under attack
        const targetPiece = board[position.y][position.x];
        board[position.y][position.x] = null;
        const canAttack = isValidMove(piece, position, board);
        // Restore the piece
        board[position.y][position.x] = targetPiece;
        if (canAttack) return true;
      }
    }
  }
  return false;
};

export const isKingInCheck = (board: (Piece | null)[][], color: PieceColor): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  return isSquareUnderAttack(kingPos, color === 'white' ? 'black' : 'white', board);
};

const wouldMoveExposeKing = (
  piece: Piece,
  targetPos: Position,
  board: (Piece | null)[][],
): boolean => {
  // Create a copy of the board
  const tempBoard = board.map(row => [...row]);
  
  // Make the move on the temporary board
  const originalPiece = tempBoard[targetPos.y][targetPos.x];
  tempBoard[piece.position.y][piece.position.x] = null;
  tempBoard[targetPos.y][targetPos.x] = {
    ...piece,
    position: targetPos,
  };
  
  // Check if the king would be in check after this move
  const wouldBeInCheck = isKingInCheck(tempBoard, piece.color);
  
  return wouldBeInCheck;
};

export const isCheckmate = (board: (Piece | null)[][], color: PieceColor): boolean => {
  // If not in check, it's not checkmate
  if (!isKingInCheck(board, color)) return false;

  // Check if any piece can make a legal move
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.color === color) {
        // Check all possible moves for this piece
        for (let toY = 0; toY < 8; toY++) {
          for (let toX = 0; toX < 8; toX++) {
            const targetPos = { x: toX, y: toY };
            if (isValidMove(piece, targetPos, board) && 
                !wouldMoveExposeKing(piece, targetPos, board)) {
              return false; // Found a legal move that prevents checkmate
            }
          }
        }
      }
    }
  }
  
  return true; // No legal moves found
};

export const isValidMove = (
  piece: Piece,
  targetPos: Position,
  board: (Piece | null)[][],
): boolean => {
  const { x: fromX, y: fromY } = piece.position;
  const { x: toX, y: toY } = targetPos;

  // Basic boundary check
  if (toX < 0 || toX > 7 || toY < 0 || toY > 7) return false;

  // Can't capture own piece
  if (board[toY][toX]?.color === piece.color) return false;

  const dx = Math.abs(toX - fromX);
  const dy = Math.abs(toY - fromY);

  let isBasicMoveValid = false;

  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;

      // Forward movement
      if (fromX === toX && !board[toY][toX]) {
        // Single square move
        if (toY - fromY === direction) isBasicMoveValid = true;
        
        // Double square move from starting position
        if (fromY === startRow && 
            toY - fromY === 2 * direction && 
            !board[fromY + direction][fromX] && 
            !board[toY][toX]) {
          isBasicMoveValid = true;
        }
      }

      // Capture diagonally
      if (Math.abs(toX - fromX) === 1 && 
          toY - fromY === direction && 
          board[toY][toX] && 
          board[toY][toX]?.color !== piece.color) {
        isBasicMoveValid = true;
      }

      break;
    }

    case 'knight':
      // Knights can jump over pieces, so no need to check path
      isBasicMoveValid = (dx === 2 && dy === 1) || (dx === 1 && dy === 2);
      break;

    case 'bishop': {
      if (dx !== dy) return false;
      isBasicMoveValid = isPathClear(piece.position, targetPos, board, true);
      break;
    }

    case 'rook': {
      if (dx !== 0 && dy !== 0) return false;
      isBasicMoveValid = isPathClear(piece.position, targetPos, board, false);
      break;
    }

    case 'queen': {
      if (dx !== dy && dx !== 0 && dy !== 0) return false;
      isBasicMoveValid = isPathClear(piece.position, targetPos, board, dx === dy);
      break;
    }

    case 'king': {
      // Check if move is only one square in any direction
      if (dx <= 1 && dy <= 1) {
        isBasicMoveValid = true;
      }
      
      // TODO: Add castling logic here
      break;
    }

    default:
      return false;
  }

  // Check if this move would leave or put the king in check
  if (isBasicMoveValid && wouldMoveExposeKing(piece, targetPos, board)) {
    return false;
  }

  return isBasicMoveValid;
};

export const getValidMoves = (piece: Piece, board: (Piece | null)[][]): Position[] => {
  const validMoves: Position[] = [];
  
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (isValidMove(piece, { x, y }, board)) {
        validMoves.push({ x, y });
      }
    }
  }

  return validMoves;
}; 