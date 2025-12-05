import { StrictMode, useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { motion } from 'framer-motion';
import './index.css';
import { GameState, Direction } from './types/game';
import { initializeGame, move, reviveGame } from './lib/game-logic';
import { Grid } from './components/game/Grid';
import { Tile } from './components/game/Tile';
import { GameOver } from './components/game/GameOver';
import { AdBanner } from './components/ads/AdBanner';

function Game() {
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);

  const handleMove = useCallback((direction: Direction) => {
    setGameState(prevState => {
      const newState = move(prevState, direction);
      if (newState.gameStatus !== 'playing' && newState.gameStatus !== prevState.gameStatus) {
        setTimeout(() => setShowGameOver(true), 500);
      }
      return newState;
    });
  }, []);

  const handleRestart = () => {
    setGameState(initializeGame());
    setShowGameOver(false);
  };

  const handleContinue = () => {
    setGameState(prev => ({ ...prev, gameStatus: 'playing' }));
    setShowGameOver(false);
  };

  const handleRevive = () => {
    setGameState(prevState => reviveGame(prevState));
    setShowGameOver(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameStatus !== 'playing') return;

      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        handleMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.gameStatus, handleMove]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || gameState.gameStatus !== 'playing') return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipeDistance) {
        handleMove(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      if (Math.abs(deltaY) > minSwipeDistance) {
        handleMove(deltaY > 0 ? 'down' : 'up');
      }
    }

    setTouchStart(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf8ef] to-[#f2e9d8] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Banner Ad - Topo */}
        <AdBanner 
          slot="1234567890" 
          format="auto" 
          className="mb-6 flex justify-center"
        />

        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-7xl font-bold text-[#776e65]">2048</h1>
            <motion.button
              onClick={handleRestart}
              className="bg-[#8f7a66] hover:bg-[#9f8a76] text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Novo Jogo
            </motion.button>
          </div>

          {/* Score Board */}
          <div className="flex gap-4">
            <motion.div
              className="bg-[#bbada0] rounded-lg px-6 py-3 flex-1 text-center shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-[#eee4da] text-sm font-bold uppercase">Pontos</div>
              <div className="text-white text-3xl font-bold">{gameState.score}</div>
            </motion.div>
            <motion.div
              className="bg-[#bbada0] rounded-lg px-6 py-3 flex-1 text-center shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-[#eee4da] text-sm font-bold uppercase">Recorde</div>
              <div className="text-white text-3xl font-bold">{gameState.bestScore}</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          className="mb-6 text-center text-[#776e65]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg">
            <span className="font-bold">Una os números e chegue ao bloco 2048!</span>
          </p>
          <p className="text-sm mt-2">
            Use as setas ⬆️⬇️⬅️➡️ ou deslize no celular 👆
          </p>
        </motion.div>

        {/* Game Board */}
        <motion.div
          className="relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Grid />
          <div className="absolute top-3 left-3">
            {gameState.tiles.map(tile => (
              <Tile key={tile.id} tile={tile} gridSize={4} />
            ))}
          </div>
        </motion.div>

        {/* Banner Ad - Rodapé */}
        <AdBanner 
          slot="0987654321" 
          format="auto" 
          className="mt-6 flex justify-center"
        />

        {/* Game Over Modal */}
        {showGameOver && gameState.gameStatus !== 'playing' && (
          <GameOver
            status={gameState.gameStatus}
            score={gameState.score}
            onRestart={handleRestart}
            onContinue={gameState.gameStatus === 'won' ? handleContinue : undefined}
            onRevive={gameState.gameStatus === 'lost' ? handleRevive : undefined}
          />
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Game />
  </StrictMode>
);
