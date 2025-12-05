import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { RewardedAd } from '../ads/RewardedAd';

interface GameOverProps {
  status: 'won' | 'lost';
  score: number;
  onRestart: () => void;
  onContinue?: () => void;
  onRevive?: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ status, score, onRestart, onContinue, onRevive }) => {
  const [showRewardedAd, setShowRewardedAd] = useState(false);

  const handleWatchAd = () => {
    setShowRewardedAd(true);
  };

  const handleAdComplete = () => {
    setShowRewardedAd(false);
    if (onRevive) {
      onRevive();
    }
  };

  const handleAdFailed = () => {
    setShowRewardedAd(false);
  };

  if (showRewardedAd) {
    return <RewardedAd onAdComplete={handleAdComplete} onAdFailed={handleAdFailed} />;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className={`text-5xl font-bold mb-4 ${status === 'won' ? 'text-green-600' : 'text-red-600'}`}>
              {status === 'won' ? '🎉 Você Venceu!' : '😢 Fim de Jogo'}
            </h2>
            <p className="text-gray-600 text-xl mb-2">Pontuação Final</p>
            <p className="text-6xl font-bold text-[#776e65] mb-6">{score}</p>
            
            <div className="space-y-3">
              {status === 'lost' && onRevive && (
                <motion.button
                  onClick={handleWatchAd}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-all shadow-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl">📺</span>
                  <span>Reviver com Anúncio</span>
                </motion.button>
              )}

              <motion.button
                onClick={onRestart}
                className="w-full bg-[#8f7a66] hover:bg-[#9f8a76] text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Novo Jogo
              </motion.button>
              
              {status === 'won' && onContinue && (
                <motion.button
                  onClick={onContinue}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ▶️ Continuar Jogando
                </motion.button>
              )}
            </div>

            {status === 'lost' && onRevive && (
              <p className="text-gray-500 text-sm mt-4">
                💰 Assista um anúncio e ganhe mais movimentos!
              </p>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
