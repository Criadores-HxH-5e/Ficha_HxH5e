import React from 'react';
import { motion } from 'motion/react';
import { Terminal, Swords, Zap, ChevronRight, LogOut } from 'lucide-react';

interface Props {
  onSelect: (mode: 'CLASSIC' | 'NEW') => void;
  onLogout: () => void;
  userName?: string;
}

export const ModeSelector: React.FC<Props> = ({ onSelect, onLogout, userName }) => {
  return (
    <div className="min-h-screen bg-black overflow-hidden flex flex-col md:flex-row">
      
      {/* LEFT SIDE: CLASSIC TERMINAL */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onClick={() => onSelect('CLASSIC')}
        className="relative flex-1 group cursor-pointer overflow-hidden border-b md:border-b-0 md:border-r border-gray-800"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-hxh-green/10 to-transparent transition-opacity group-hover:opacity-100 opacity-40 z-0" />
        
        {/* Background Visuals */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <Terminal size={400} />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            className="w-20 h-20 bg-hxh-green/20 rounded-full flex items-center justify-center mb-6 border border-hxh-green/30 text-hxh-green"
          >
            <Terminal size={40} />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-4 tracking-tighter uppercase italic">
            Torre Celestial <span className="text-hxh-green">Cannon</span>
          </h2>
          
          <p className="text-gray-400 font-mono text-sm max-w-md mb-8 leading-relaxed">
            Acesse o sistema da Torre Celestial no formato do anime, com apostas entre os personagens cannon, jogadores e NPCs (dinheiro apenas para personagens).
          </p>

          <div className="flex items-center gap-2 text-hxh-green font-bold tracking-[0.2em] text-xs uppercase group-hover:translate-x-2 transition-transform">
            Entrar na Torre <ChevronRight size={16} />
          </div>
        </div>

        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%]" />
      </motion.div>

      {/* RIGHT SIDE: NEW MODEL (V2) */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        onClick={() => onSelect('NEW')}
        className="relative flex-1 group cursor-pointer bg-black overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-bl from-hxh-blue/10 to-transparent transition-opacity group-hover:opacity-100 opacity-40 z-0" />

        {/* Background Visuals */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <Swords size={400} />
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-20 h-20 bg-hxh-blue/20 rounded-full flex items-center justify-center mb-6 border border-hxh-blue/30 text-hxh-blue"
          >
            <Zap size={40} />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-4 tracking-tighter uppercase italic">
            Torre Celestial <span className="text-hxh-blue text-glow">- Ascenção</span>
          </h2>
          
          <p className="text-gray-400 font-mono text-sm max-w-md mb-8 leading-relaxed">
            Experimente o novo modelo de batalhas e investimentos. O futuro da Torre Celestial com retornos reais. Nada de apostas!
          </p>

          <div className="flex items-center gap-2 text-hxh-blue font-bold tracking-[0.2em] text-xs uppercase group-hover:translate-x-2 transition-transform">
            Entrar na Torre <ChevronRight size={16} />
          </div>
        </div>

        {/* Overlay for "COMING SOON" feel if needed, but the user asked to pick */}
        <div className="absolute bottom-6 right-6 font-mono text-[10px] text-gray-700 uppercase tracking-widest opacity-50">
          PROTOTYPE 0.2.0
        </div>
      </motion.div>

      {/* Welcome Message overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
        <p className="text-[10px] text-gray-500 font-mono tracking-[0.5em] uppercase mb-2">Authenticated Hunter</p>
        <h1 className="text-xl font-display font-medium text-white tracking-widest uppercase mb-4">
          {userName || 'User'}
        </h1>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-[10px] text-gray-500 hover:text-red-500 hover:border-red-500/30 transition-all font-mono uppercase tracking-[0.2em] pointer-events-auto"
        >
          <LogOut size={12} /> Sair da Conta
        </button>
      </div>

    </div>
  );
};
