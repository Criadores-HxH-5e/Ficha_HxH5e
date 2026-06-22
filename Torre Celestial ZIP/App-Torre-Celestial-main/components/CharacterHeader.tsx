import React, { useState, useRef, useEffect } from 'react';
import { Character, DiscordUser } from '../types';
import { NEN_COLORS, DISCORD_ROLES } from '../constants';
import { Shield, Zap, Heart, Star, User, Crown, Gavel, Wallet, ChevronDown } from 'lucide-react';
import type { SbFighter } from '../App';

interface Props {
  character: Character;
  mode: 'BETTOR' | 'FIGHTER';
  discordUser?: DiscordUser | null;
  onSwitchMode?: () => void;
  sbFighters?: SbFighter[];
  activeSbFighterId?: string | null;
  onSbFighterSelect?: (id: string) => void;
}

export const CharacterHeader: React.FC<Props> = ({
  character,
  mode,
  discordUser,
  onSwitchMode,
  sbFighters = [],
  activeSbFighterId,
  onSbFighterSelect,
}) => {
  const nenColor = NEN_COLORS[character.nenType] || '#fff';
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const userRoles = discordUser?.roles || [];
  const isJudge    = DISCORD_ROLES.JUDGE.some(id => userRoles.includes(id));
  const isInvestor = DISCORD_ROLES.INVESTOR.some(id => userRoles.includes(id));

  useEffect(() => {
    if (!showPicker) return;
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPicker]);

  const activeSbFighter = sbFighters.find(f => f.id === activeSbFighterId);
  // Use fighter image when one is selected, fallback to Discord avatar
  const avatarUrl = activeSbFighter?.image_url || discordUser?.avatar || null;

  // MODO CIVIL (Investidor)
  if (mode === 'BETTOR') {
    return (
      <div className={`relative border-b h-48 flex items-end overflow-hidden group transition-all duration-500 ${character.isFloorMaster ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'border-gray-800'}`}>
        <div className="absolute inset-0 bg-[url('https://i.pinimg.com/1200x/da/36/ce/da36ce1253ec28972943839ae17b3914.jpg')] bg-cover bg-center opacity-60 group-hover:opacity-70 transition-opacity duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-6 flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center bg-gray-800 shadow-xl overflow-hidden relative ${character.isFloorMaster ? 'border-yellow-500' : 'border-gray-900'}`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
              {character.isFloorMaster && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 text-black p-1 rounded-full shadow-lg">
                  <Crown size={12} fill="currentColor" />
                </div>
              )}
            </div>

            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                {isJudge ? (
                  <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 px-2 py-0.5 rounded text-[10px] font-black text-red-400 uppercase tracking-tighter shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    <Gavel size={12} /> Staff / Mestre de Arena
                  </div>
                ) : isInvestor ? (
                  <div className="flex items-center gap-2 bg-hxh-green/20 border border-hxh-green/50 px-2 py-0.5 rounded text-[10px] font-black text-hxh-green uppercase tracking-tighter shadow-[0_0_10px_rgba(0,255,65,0.2)]">
                    <Wallet size={12} /> Investidor da Torre
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-display font-black text-white tracking-wider text-shadow-sm">
                  {activeSbFighter?.name || discordUser?.username || character.name}
                </h1>
                {character.isFloorMaster && (
                  <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1">
                    <Crown size={10} fill="currentColor" /> Floor Master
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {discordUser && (
                  <span className="bg-[#5865F2] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    {discordUser.username}#{discordUser.discriminator}
                  </span>
                )}
                <span className="text-gray-400 text-sm font-mono">ID: {discordUser?.id.slice(0, 8)}...</span>

                {/* Fighter selector (Supabase tc_fighters) */}
                {onSbFighterSelect && (
                  <div className="relative" ref={pickerRef}>
                    <button
                      onClick={() => setShowPicker(p => !p)}
                      className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-[10px] text-hxh-green font-bold px-2 py-0.5 rounded border border-hxh-green/40 transition-colors uppercase tracking-widest"
                    >
                      {activeSbFighter ? activeSbFighter.name : 'Escolher Personagem'}
                      <ChevronDown size={10} />
                    </button>
                    {showPicker && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-gray-900 border border-gray-700 rounded shadow-xl z-50">
                        {sbFighters.length === 0 ? (
                          <div className="px-3 py-2 text-[11px] text-gray-500">Nenhum personagem cadastrado</div>
                        ) : (
                          sbFighters.map(f => (
                            <button
                              key={f.id}
                              onClick={() => { onSbFighterSelect(f.id); setShowPicker(false); }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-800 transition-colors ${f.id === activeSbFighterId ? 'text-hxh-green' : 'text-gray-300'}`}
                            >
                              <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-600">
                                {f.image_url ? (
                                  <img src={f.image_url} alt={f.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <span className="text-[11px] font-bold">{f.name.charAt(0)}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold truncate">{f.name}</div>
                                <div className="text-[10px] text-gray-500">{f.nen_type} · Andar {f.floor ?? 1}</div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                {onSwitchMode && (
                  <button
                    onClick={onSwitchMode}
                    className="bg-gray-800 hover:bg-gray-700 text-[10px] text-gray-300 font-bold px-2 py-0.5 rounded border border-gray-700 transition-colors uppercase tracking-widest"
                  >
                    Trocar Modelo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-right hidden md:block">
            <p className="text-hxh-green font-display text-sm tracking-widest uppercase mb-1">Status da Conexão</p>
            <div className="flex items-center justify-end gap-2">
              <span className="w-2 h-2 bg-hxh-green rounded-full animate-pulse" />
              <span className="text-white font-bold">ONLINE • TORRE CELESTIAL</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MODO CAÇADOR (Competidor)
  return (
    <div className={`bg-hxh-panel border-b p-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden transition-all duration-500 ${character.isFloorMaster ? 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'border-gray-800'}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-hxh-green/10 to-transparent pointer-events-none" />

      <div className="flex items-center gap-4 z-10">
        <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-gray-900 text-2xl font-display font-bold relative overflow-hidden ${character.isFloorMaster ? 'border-yellow-500 text-yellow-500' : 'border-hxh-green text-hxh-green'}`}>
          {character.imageUrl ? (
            <img src={character.imageUrl} alt="Combatant" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            character.name.charAt(0)
          )}
          {character.isFloorMaster && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-black p-1 rounded-full shadow-lg z-20">
              <Crown size={14} fill="currentColor" />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-display font-bold text-white tracking-wider">{character.name}</h1>
            {character.isFloorMaster && (
              <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1">
                <Crown size={10} fill="currentColor" /> Floor Master
              </span>
            )}
            {onSwitchMode && (
              <button
                onClick={onSwitchMode}
                className="ml-4 bg-gray-800/50 hover:bg-hxh-blue/20 text-[10px] text-hxh-blue font-bold px-2 py-0.5 rounded border border-hxh-blue/30 transition-all uppercase tracking-widest"
              >
                V2 Selector
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 font-body">
            <span style={{ color: nenColor }} className="font-bold uppercase tracking-widest">{character.nenType}</span>
            <span>•</span>
            <span>Nível {character.level}</span>
            <span>•</span>
            <div className="flex items-center text-yellow-400">
              <Star size={14} fill="currentColor" />
              <span className="ml-1">{character.hunterStars} Estrela</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 z-10 w-full md:w-auto justify-around md:justify-end">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs uppercase mb-1">
            <Heart size={14} /> PV
          </div>
          <div className="text-2xl font-display font-bold text-white">
            {character.hitPoints.current} <span className="text-gray-600 text-lg">/ {character.hitPoints.max}</span>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs uppercase mb-1">
            <Zap size={14} /> Aura
          </div>
          <div className="text-2xl font-display font-bold text-hxh-blue">
            {character.auraPoints.current} <span className="text-gray-600 text-lg">/ {character.auraPoints.max}</span>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-gray-400 text-xs uppercase mb-1">
            <Shield size={14} /> DEF
          </div>
          <div className="text-2xl font-display font-bold text-white">
            {10 + Math.floor((character.attributes.dexterity - 10) / 2)}
          </div>
        </div>
      </div>
    </div>
  );
};
