import React, { useState } from 'react';
import { Character, TowerFloorData } from '../types.ts';
import { TOWER_FLOOR_DATA } from '../constants.ts';
import { Trophy, Skull, Swords, DollarSign, Users, ChevronUp, Home, Gift, ImagePlus, UserCircle, Upload } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  character: Character;
  onUpdate?: (updates: Partial<Character>) => Promise<void>;
}

export const CompetitorDashboard: React.FC<Props> = ({ character, onUpdate }) => {
  const { fighterStats } = character;
  const [showImageModal, setShowImageModal] = useState(false);
  const [newImg, setNewImg] = useState(character.imageUrl || '');
  
  // Find Floor Data
  const floorData: TowerFloorData | undefined = TOWER_FLOOR_DATA.find(
      d => fighterStats.currentFloor >= d.minFloor && fighterStats.currentFloor <= d.maxFloor
  );

  // Prepare Battle History Data
  const battleData = [
    { name: 'Vitórias', value: fighterStats.totalWins },
    { name: 'Derrotas', value: fighterStats.totalLosses }
  ];
  const COLORS = ['#00ff41', '#ff003c'];

  // Total Liquid Funds for display purposes in Fighter Mode
  const totalFunds = character.jenny + character.trainingJenny;

  const handleImageSave = async () => {
    if (onUpdate) {
        await onUpdate({ imageUrl: newImg });
        setShowImageModal(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) {
        alert("Imagem muito pesada! Máximo 800KB.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        setNewImg(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 animate-fade-in relative">
      
      {/* IMAGE SELECTION MODAL */}
      {showImageModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
               <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowImageModal(false)} />
               <div className="relative bg-hxh-panel border border-hxh-green/30 p-8 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in custom-scrollbar">
                   <h3 className="text-xl font-display font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2 sticky top-0 bg-hxh-panel pb-2 z-10">
                       <ImagePlus className="text-hxh-green" /> Identidade Visual do Hunter
                   </h3>

                   <div className="mb-6 aspect-square bg-gray-950 rounded-lg overflow-hidden border border-gray-800 flex items-center justify-center">
                       {newImg ? <img src={newImg} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <UserCircle size={64} className="text-gray-800" />}
                   </div>

                   <div className="space-y-4">
                       <div>
                           <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1">URL da Imagem</label>
                           <input 
                             className="w-full bg-black border border-gray-800 rounded p-3 text-white focus:border-hxh-green outline-none text-xs font-mono"
                             value={newImg}
                             onChange={e => setNewImg(e.target.value)}
                             placeholder="https://..."
                           />
                       </div>

                       <div>
                           <label className="text-center block text-gray-500 text-[10px] uppercase font-bold mb-1">Ou carregar arquivo</label>
                           <input 
                             type="file" 
                             accept="image/*"
                             onChange={handleFileUpload}
                             className="hidden" 
                             id="dash-upload"
                           />
                           <label htmlFor="dash-upload" className="w-full bg-gray-900 border border-gray-800 rounded p-3 text-gray-400 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-800 text-xs font-bold uppercase transition-colors">
                               <Upload size={14} /> Carregar da Galeria
                           </label>
                       </div>
                   </div>

                   <div className="flex gap-3 mt-8">
                        <button 
                            onClick={() => setShowImageModal(false)}
                            className="flex-1 py-3 bg-gray-900 text-white font-bold rounded uppercase text-xs"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleImageSave}
                            className="flex-1 py-3 bg-hxh-green text-black font-bold rounded uppercase text-xs shadow-[0_0_15px_rgba(0,255,65,0.3)]"
                        >
                            Atualizar Foto
                        </button>
                   </div>
               </div>
          </div>
      )}

      {/* LEFT: Stats & Confidence (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
         
         {/* Profile Card & Balance */}
         <div className="bg-hxh-panel border border-hxh-green/30 p-6 rounded-lg shadow-[0_0_15px_rgba(0,255,65,0.1)] relative overflow-hidden group">
             {/* Character Background Image */}
             {character.imageUrl && (
                 <div 
                    className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity duration-700"
                    style={{ backgroundImage: `url(${character.imageUrl})` }}
                 />
             )}
             
             <div className="relative z-10 flex flex-col items-center mb-6">
                 <button 
                    onClick={() => { setNewImg(character.imageUrl || ''); setShowImageModal(true); }}
                    className="relative w-24 h-24 rounded-full border-2 border-hxh-green overflow-hidden bg-black flex items-center justify-center hover:scale-105 transition-transform"
                 >
                     {character.imageUrl ? (
                         <img src={character.imageUrl} alt={character.name} className="w-full h-full object-cover" />
                     ) : (
                         <div className="flex flex-col items-center gap-1 text-gray-700">
                             <ImagePlus size={24} />
                             <span className="text-[8px] uppercase font-black">FOTO</span>
                         </div>
                     )}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="text-[10px] text-white font-bold uppercase underline">Trocar</span>
                     </div>
                 </button>
                 <h2 className="mt-4 text-2xl font-display font-bold text-white uppercase">{character.name}</h2>
                 <p className="text-hxh-green text-xs font-mono uppercase tracking-widest">Hunter de Elite</p>
             </div>

             <div className="relative z-10 flex justify-between items-start pt-4 border-t border-gray-800">
                 <div>
                    <h2 className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Andar Atual</h2>
                    <div className="text-5xl font-display font-bold text-white tracking-tighter">
                        {fighterStats.currentFloor}
                    </div>
                 </div>
                 <div className="text-right">
                    <h2 className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Ganhos Totais</h2>
                    <div className="text-xl font-display font-bold text-hxh-green tracking-wide">
                        {totalFunds.toLocaleString()} TC Coin
                    </div>
                 </div>
             </div>
         </div>

         {/* Floor Info / Benefits */}
         {floorData && (
             <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                 <h3 className="w-full text-white font-display text-sm mb-4 border-l-4 border-purple-500 pl-2 uppercase tracking-wider">
                     Dados do Andar {floorData.minFloor}-{floorData.maxFloor}
                 </h3>
                 <div className="space-y-4">
                     <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
                            <Home size={14} /> Custo Moradia
                        </div>
                        <span className="text-white font-mono font-bold">{floorData.housingLabel}</span>
                     </div>
                     <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                        <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
                            <Gift size={14} /> Prêmio Vitórias
                        </div>
                        <span className="text-hxh-green font-mono font-bold">
                             {typeof floorData.prizeMoney === 'number' 
                                ? `${floorData.prizeMoney.toLocaleString()} J` 
                                : floorData.prizeMoney}
                        </span>
                     </div>
                     <div>
                        <div className="text-gray-500 text-[10px] uppercase mb-1">Benefícios</div>
                        <div className="text-white text-sm">{floorData.benefits}</div>
                     </div>
                 </div>
             </div>
         )}

         {/* Battle History Chart */}
         <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col items-center">
             <h3 className="w-full text-white font-display text-sm mb-4 border-l-4 border-hxh-blue pl-2 uppercase tracking-wider">
                 Registro de Combate
             </h3>
             <div className="w-48 h-48 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={battleData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                        {battleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#111', borderRadius: '8px', border: '1px solid #333' }} />
                    </PieChart>
                 </ResponsiveContainer>
                 {/* Center Text */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-2xl font-bold text-white">{fighterStats.totalWins + fighterStats.totalLosses}</span>
                     <span className="text-[10px] text-gray-500 uppercase">Lutas</span>
                 </div>
             </div>
             <div className="flex gap-6 mt-4 text-sm">
                 <span className="flex items-center gap-2 font-bold text-hxh-green"><div className="w-2 h-2 rounded-full bg-hxh-green"/> {fighterStats.totalWins} Vitórias</span>
                 <span className="flex items-center gap-2 font-bold text-hxh-accent"><div className="w-2 h-2 rounded-full bg-hxh-accent"/> {fighterStats.totalLosses} Derrotas</span>
             </div>
         </div>
      </div>

      {/* RIGHT: Floor Master Track (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
          {fighterStats.currentFloor >= 200 ? (
              <div className="bg-black border-2 border-hxh-green/50 rounded-xl p-8 h-full flex flex-col justify-center relative overflow-hidden">
                   {/* BG Effect */}
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                   
                   <div className="relative z-10 text-center mb-10">
                       <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-tighter mb-2 text-shadow-green">
                           Desafio Mestre de Andar
                       </h2>
                       <p className="text-hxh-green font-mono tracking-widest text-sm uppercase">
                           Vença 10 lutas para desafiar um Mestre de Andar. 4 Derrotas resultam em desclassificação.
                       </p>
                   </div>

                   {/* Wins Track */}
                   <div className="relative z-10 mb-12 flex justify-center">
                       <div className="flex justify-between items-center w-full max-w-3xl px-4">
                           {Array.from({ length: 10 }).map((_, i) => {
                               const active = i < fighterStats.floorMasterWins;
                               return (
                                   <div key={i} className="flex flex-col items-center gap-2">
                                       <div 
                                           className={`w-8 h-12 md:w-12 md:h-16 skew-x-[-10deg] border-2 flex items-center justify-center transition-all duration-500
                                           ${active 
                                              ? 'bg-hxh-green border-hxh-green shadow-[0_0_15px_#00ff41]' 
                                              : 'bg-gray-900 border-gray-700 opacity-50'}
                                           `}
                                       >
                                           <span className={`font-display font-bold ${active ? 'text-black' : 'text-gray-600'}`}>
                                               {i + 1}
                                           </span>
                                       </div>
                                   </div>
                               );
                           })}
                       </div>
                       <div className="h-1 bg-gray-800 absolute top-1/2 left-4 right-4 -z-10" />
                   </div>

                   {/* Losses Track */}
                   <div className="relative z-10 flex justify-center">
                       <div className="max-w-xl w-full bg-red-900/10 border border-red-900/30 rounded-full py-4 px-8 flex items-center justify-between gap-4">
                           <span className="text-red-500 font-bold uppercase tracking-widest text-sm">Zona de Risco</span>
                           <div className="flex gap-4">
                               {Array.from({ length: 4 }).map((_, i) => {
                                   const active = i < fighterStats.floorMasterLosses;
                                   return (
                                       <div 
                                           key={i} 
                                           className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                                           ${active 
                                              ? 'bg-red-600 border-red-600 shadow-[0_0_15px_#ff003c]' 
                                              : 'bg-black border-gray-800'}
                                           `}
                                       >
                                           <Skull size={18} className={active ? 'text-black' : 'text-gray-700'} />
                                       </div>
                                   );
                               })}
                           </div>
                       </div>
                   </div>

                   {fighterStats.floorMasterWins === 10 && (
                       <div className="mt-8 text-center animate-bounce">
                           <button className="bg-yellow-500 text-black font-black text-xl px-10 py-4 uppercase tracking-widest rounded shadow-[0_0_20px_#eab308]">
                               DESAFIAR MESTRE
                           </button>
                       </div>
                   )}
              </div>
          ) : (
              <div className="h-full bg-gray-900 border border-gray-800 rounded-lg flex flex-col items-center justify-center p-12 text-center opacity-50 min-h-[400px]">
                  <Swords size={64} className="text-gray-700 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-500 uppercase">Desafio Bloqueado</h3>
                  <p className="text-gray-600 font-mono">Chegue ao andar 200 para desbloquear o caminho da glória.</p>
                  <p className="text-hxh-green/50 text-xs mt-2 uppercase tracking-widest">Andar Atual: {fighterStats.currentFloor}</p>
              </div>
          )}
      </div>

    </div>
  );
};