import React, { useEffect, useState } from 'react';
import { Radio, X } from 'lucide-react';

interface Props {
  message: string;
  isActive: boolean;
  onDismiss: () => void;
}

export const ArenaNotification: React.FC<Props> = ({ message, isActive, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setVisible(true);
      // Auto dismiss removed or extended significantly to allow manual interaction?
      // Keeping a long timer (10s) just in case, but primary interaction is manual now.
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const handleDismiss = () => {
      setVisible(false);
      setTimeout(onDismiss, 500); // Wait for exit animation
  };

  if (!isActive && !visible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-start justify-center pt-24 transition-opacity duration-300 ${visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
      {/* Backdrop / Click Outside to Close */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      />

      {/* Notification Box */}
      <div 
        className={`relative z-10 w-[90%] max-w-2xl transition-all duration-500 ease-out
        ${visible ? 'translate-y-0 scale-100' : '-translate-y-10 scale-90'}`}
        onClick={(e) => e.stopPropagation()} // Prevent click on box from closing
      >
        <div className="bg-hxh-dark border-2 border-hxh-green shadow-[0_0_50px_rgba(0,255,65,0.2)] relative overflow-hidden clip-path-polygon p-1 group">
            
            {/* Close Button */}
            <button 
                onClick={handleDismiss}
                className="absolute top-2 right-2 z-20 text-gray-500 hover:text-white transition-colors bg-black/50 p-1 rounded cursor-pointer"
            >
                <X size={20} />
            </button>

            {/* Animated Scanline */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-hxh-green/10 to-transparent animate-scanline pointer-events-none" />
            
            <div className="bg-black/90 p-8 flex flex-col items-center justify-center relative">
                <div className="flex items-center gap-2 text-hxh-green font-bold text-xs tracking-[0.3em] uppercase mb-4 animate-pulse">
                    <Radio size={16} />
                    Sinal Recebido: Discord Bot
                </div>
                
                <h2 className="text-2xl md:text-4xl font-display font-black text-white uppercase italic tracking-tighter text-shadow-green text-center leading-tight">
                    {message}
                </h2>
                
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-hxh-green to-transparent mt-6" />
                
                <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-2">
                    Toque fora para fechar
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
