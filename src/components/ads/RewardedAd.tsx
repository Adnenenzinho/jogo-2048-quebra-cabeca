import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface RewardedAdProps {
  onAdComplete: () => void;
  onAdFailed?: () => void;
}

export const RewardedAd: React.FC<RewardedAdProps> = ({ onAdComplete, onAdFailed }) => {
  const [adProgress, setAdProgress] = useState(0);
  const [adStatus, setAdStatus] = useState<'loading' | 'playing' | 'completed' | 'failed'>('loading');

  useEffect(() => {
    // Simula carregamento do anúncio
    const loadTimeout = setTimeout(() => {
      setAdStatus('playing');
      startAdPlayback();
    }, 1000);

    return () => clearTimeout(loadTimeout);
  }, []);

  const startAdPlayback = () => {
    // Simula reprodução de anúncio de 5 segundos
    const duration = 5000;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setAdProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        clearInterval(timer);
        setAdStatus('completed');
        setTimeout(() => {
          onAdComplete();
        }, 500);
      }
    }, interval);
  };

  const handleSkip = () => {
    setAdStatus('failed');
    if (onAdFailed) {
      onAdFailed();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full mx-4"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {adStatus === 'loading' && (
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">📺</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Carregando Anúncio...</h3>
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {adStatus === 'playing' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-5xl mb-4">🎬</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Assistindo Anúncio</h3>
              <p className="text-gray-600">Aguarde para ganhar sua recompensa...</p>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${adProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            {/* Área do Anúncio Real (Google AdSense) */}
            <div className="bg-gray-50 rounded-lg p-8 border-2 border-gray-200 min-h-[250px] flex items-center justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot="YYYYYYYYYY"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
              
              {/* Fallback para quando não há anúncio disponível */}
              <div className="text-center text-gray-500">
                <p className="text-sm mb-2">🎯 Espaço Publicitário</p>
                <p className="text-xs">Configure seu Google AdSense para exibir anúncios reais</p>
              </div>
            </div>

            <p className="text-gray-500 text-sm mt-4">
              ⏱️ {Math.ceil((100 - adProgress) / 20)} segundos restantes
            </p>
          </div>
        )}

        {adStatus === 'completed' && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">Recompensa Ganha!</h3>
            <p className="text-gray-600">Você ganhou uma nova chance!</p>
          </motion.div>
        )}

        {adStatus === 'failed' && (
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-2xl font-bold text-red-600 mb-2">Anúncio Cancelado</h3>
            <p className="text-gray-600">Você precisa assistir o anúncio completo para ganhar a recompensa.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
