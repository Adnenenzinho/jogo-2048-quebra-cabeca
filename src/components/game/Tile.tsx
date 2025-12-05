import { motion } from 'framer-motion';
import { Tile as TileType } from '../../types/game';

interface TileProps {
  tile: TileType;
  gridSize: number;
}

const getTileColor = (value: number): string => {
  const colors: Record<number, string> = {
    2: 'bg-[#eee4da] text-[#776e65]',
    4: 'bg-[#ede0c8] text-[#776e65]',
    8: 'bg-[#f2b179] text-white',
    16: 'bg-[#f59563] text-white',
    32: 'bg-[#f67c5f] text-white',
    64: 'bg-[#f65e3b] text-white',
    128: 'bg-[#edcf72] text-white',
    256: 'bg-[#edcc61] text-white',
    512: 'bg-[#edc850] text-white',
    1024: 'bg-[#edc53f] text-white',
    2048: 'bg-[#edc22e] text-white',
  };
  return colors[value] || 'bg-[#3c3a32] text-white';
};

const getTileSize = (value: number): string => {
  if (value >= 1024) return 'text-3xl';
  if (value >= 128) return 'text-4xl';
  return 'text-5xl';
};

export const Tile: React.FC<TileProps> = ({ tile, gridSize }) => {
  const cellSize = 100; // Size of each cell in pixels
  const gap = 12; // Gap between cells

  const x = tile.position.col * (cellSize + gap);
  const y = tile.position.row * (cellSize + gap);

  return (
    <motion.div
      key={tile.id}
      className={`absolute w-[100px] h-[100px] rounded-lg flex items-center justify-center font-bold ${getTileColor(tile.value)} ${getTileSize(tile.value)} shadow-lg`}
      initial={tile.isNew ? { scale: 0, x, y } : false}
      animate={{
        x,
        y,
        scale: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        duration: 0.15,
      }}
    >
      {tile.value}
    </motion.div>
  );
};
