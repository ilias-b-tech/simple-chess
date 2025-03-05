import React, { useState, useEffect } from 'react';
import { Piece, Position, Square } from '../types/chess';
import { initialBoardSetup, isValidMove, getValidMoves, isKingInCheck, isCheckmate } from '../utils/chessUtils';
import ChessPiece from './ChessPiece';
import '../styles/ChessBoard.css';

const ChessBoard: React.FC = () => {
  const [board, setBoard] = useState<(Piece | null)[][]>(initialBoardSetup());
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'white' | 'black'>('white');
  const [isInCheck, setIsInCheck] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);

  useEffect(() => {
    // Add viewport meta tag for mobile
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  useEffect(() => {
    // Check for check and checkmate after each move
    const check = isKingInCheck(board, currentPlayer);
    setIsInCheck(check);
    
    if (check) {
      const mate = isCheckmate(board, currentPlayer);
      if (mate) {
        setIsGameOver(true);
      }
    }
  }, [currentPlayer, board]);

  const handleSquareClick = (x: number, y: number) => {
    if (isGameOver) return;

    const clickedPiece = board[y][x];

    // If no piece is selected and clicked on a piece
    if (!selectedPiece && clickedPiece && clickedPiece.color === currentPlayer) {
      setSelectedPiece(clickedPiece);
      setValidMoves(getValidMoves(clickedPiece, board));
      return;
    }

    // If a piece is selected and clicked on a valid move position
    if (selectedPiece && validMoves.some(move => move.x === x && move.y === y)) {
      const newBoard = board.map(row => [...row]);
      
      // Remove piece from old position
      newBoard[selectedPiece.position.y][selectedPiece.position.x] = null;
      
      // Place piece in new position
      const updatedPiece = {
        ...selectedPiece,
        position: { x, y },
        hasMoved: true,
      };
      newBoard[y][x] = updatedPiece;

      setBoard(newBoard);
      setSelectedPiece(null);
      setValidMoves([]);
      setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
      return;
    }

    // Deselect if clicking elsewhere
    setSelectedPiece(null);
    setValidMoves([]);
  };

  const handleTouchStart = (e: React.TouchEvent, x: number, y: number) => {
    e.preventDefault();
    setTouchStartTime(Date.now());
  };

  const handleTouchEnd = (e: React.TouchEvent, x: number, y: number) => {
    e.preventDefault();
    const touchDuration = Date.now() - touchStartTime;
    
    // Only process tap if touch duration is less than 500ms
    if (touchDuration < 500) {
      handleSquareClick(x, y);
    }
  };

  const isSquareHighlighted = (x: number, y: number): boolean => {
    return validMoves.some(move => move.x === x && move.y === y);
  };

  const getGameStatus = () => {
    if (isGameOver) {
      const winner = currentPlayer === 'white' ? 'Black' : 'White';
      return `Checkmate! ${winner} wins!`;
    }
    if (isInCheck) {
      return `${currentPlayer === 'white' ? 'White' : 'Black'} is in check!`;
    }
    return `Current Player: ${currentPlayer}`;
  };

  return (
    <div className="chess-board">
      {board.map((row, y) => (
        <div key={y} className="board-row">
          {row.map((piece, x) => {
            const isLight = (x + y) % 2 === 0;
            const isHighlighted = isSquareHighlighted(x, y);
            const isSelected = selectedPiece?.position.x === x && selectedPiece?.position.y === y;
            const isKingChecked = piece?.type === 'king' && 
                                piece.color === currentPlayer && 
                                isInCheck;

            return (
              <div
                key={`${x}-${y}`}
                className={`square ${isLight ? 'light' : 'dark'} 
                          ${isHighlighted ? 'highlighted' : ''} 
                          ${isSelected ? 'selected' : ''}
                          ${isKingChecked ? 'checked' : ''}`}
                onClick={() => handleSquareClick(x, y)}
                onTouchStart={(e) => handleTouchStart(e, x, y)}
                onTouchEnd={(e) => handleTouchEnd(e, x, y)}
              >
                {piece && <ChessPiece piece={piece} />}
              </div>
            );
          })}
        </div>
      ))}
      <div className={`game-status ${isInCheck ? 'check' : ''} ${isGameOver ? 'checkmate' : ''}`}>
        {getGameStatus()}
      </div>
    </div>
  );
};

export default ChessBoard; 