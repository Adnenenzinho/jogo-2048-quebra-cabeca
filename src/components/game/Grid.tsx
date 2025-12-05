import { motion } from 'framer-motion';

const GRID_SIZE = 4;

export const Grid: React.FC = () => {
  const cells = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      cells.push(
        <motion.div
          key={`${row}-${col}`}
          className="w-[100px] h-[100px] bg-[#cdc1b4] rounded-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: (row * GRID_SIZE + col) * 0.02 }}
        />
      );
    }
  }

  return (
    <div className="relative bg-[#bbada0] p-3 rounded-xl shadow-2xl">
      <div className="grid grid-cols-4 gap-3">
        {cells}
      </div>
    </div>
  );
};
