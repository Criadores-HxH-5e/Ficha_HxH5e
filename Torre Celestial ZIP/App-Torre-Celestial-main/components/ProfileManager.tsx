import React, { useState, useEffect, useCallback } from 'react';
import { Character, NenType } from '../types';
import { SwitchCamera, ShieldCheck, Info, RefreshCw, Search } from 'lucide-react';
import { supabase } from '../src/supabase';

interface DbChar {
  id: string;
  data: any;
}

interface ProfileManagerProps {
  discordUserId: string;
  activeCharId: string | null;
  onSelect: (char: Character) => void;
  isCompetitor: boolean;
}

function mapDbToChar(row: DbChar): Character | null {
  const d = row.data;
  if (!d || !d.name) return null;
  return {
    id:            row.id,
    ownerId:       d.ownerId || d.user_id || '',
    discordId:     d.discordId || d.discord_id,
    name:          d.name,
    level:         d.level ?? 1,
    floor:         d.floor ?? 1,
    hunterStars:   d.hunterStars ?? 1,
    nenType:       d.nenType ?? d.class ?? NenType.REFORCO,
    isFloorMaster: d.isFloorMaster ?? false,
    auraPoints:    d.auraPoints   ?? { current: 0, max: 0 },
    hitPoints:     d.hitPoints    ?? { current: 0, max: 0 },
    attributes:    d.attributes   ?? { strength:10, dexterity:10, constitution:10, intelligence:10, wisdom:10, charisma:10 },
    jenny:         d.jenny        ?? 0,
    trainingJenny: d.trainingJenny ?? 0,
    investmentsPlaced: d.investmentsPlaced ?? 0,
    investmentHistory: d.investmentHistory ?? [],
    fighterStats:  d.fighterStats  ?? { currentFloor:1, totalWins:0, totalLosses:0, floorMasterWins:0, floorMasterLosses:0, hype:{totalInvestmentsCount:0,totalJennyVolume:0}, battleHistory:[] },
    totalEarnings: d.totalEarnings ?? 0,
    imageUrl:      d.imageUrl ?? d.image_url,
  };
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  discordUserId,
  activeCharId,
  onSelect,
  isCompetitor,
}) => {
  const [dbChars, setDbChars]   = useState<Character[]>([]);
  const [loading, setLoading]   = useState(false);
  const [fetched, setFetched]   = useState(false);

  const fetchChars = useCallback(async () => {
    if (!discordUserId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('characters')
      .select('id, data')
      .eq('user_id', discordUserId)
      .order('last_mod', { ascending: false });
    if (!error && data) {
      const mapped = (data as DbChar[]).map(mapDbToChar).filter(Boolean) as Character[];
      setDbChars(mapped);
    }
    setLoading(false);
    setFetched(true);
  }, [discordUserId]);

  useEffect(() => { fetchChars(); }, [fetchChars]);

  const canSelect = isCompetitor;

  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl text-white tracking-widest uppercase flex items-center gap-2">
          <SwitchCamera className="text-hxh-blue" /> Seletor de Perfil Hunter
        </h2>
        <button
          onClick={fetchChars}
          disabled={loading}
          className="flex items-center gap-2 bg-hxh-blue text-black px-4 py-2 rounded font-bold text-xs uppercase hover:bg-cyan-400 transition-all disabled:opacity-60"
        >
          {loading
            ? <><RefreshCw size={14} className="animate-spin" /> Buscando...</>
            : <><Search size={14} /> Buscar Personagem ({dbChars.length}/2)</>
          }
        </button>
      </div>

      {!isCompetitor && (
        <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-lg flex items-start gap-4 mb-4">
          <Info className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-200 text-sm font-bold uppercase mb-1">Acesso Bloqueado</p>
            <p className="text-red-200/60 text-xs">
              A seleção de personagens é exclusiva para membros com o cargo
              <span className="text-red-400 mx-1">Investidor/Competidor</span> no Discord.
            </p>
          </div>
        </div>
      )}

      {fetched && dbChars.length === 0 && isCompetitor && (
        <div className="bg-gray-800/40 border border-gray-700/40 p-6 rounded-lg text-center">
          <p className="text-gray-400 text-sm mb-1">Nenhum personagem encontrado nesta conta.</p>
          <p className="text-gray-600 text-xs">Crie personagens no HxH5e RPG e eles aparecerão aqui.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dbChars.map(char => (
          <button
            key={char.id}
            onClick={() => canSelect && onSelect(char)}
            disabled={!canSelect}
            className={`
              relative p-4 rounded-lg border-2 transition-all group flex items-start gap-4 text-left
              ${activeCharId === char.id
                ? 'border-hxh-green bg-hxh-green/10 shadow-[0_0_15px_rgba(0,255,65,0.2)]'
                : 'border-gray-700 bg-black/40 hover:border-gray-500'}
              ${!canSelect ? 'cursor-not-allowed opacity-60' : ''}
            `}
          >
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center text-xl font-display font-bold text-hxh-green">
              {char.imageUrl ? (
                <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                char.name.charAt(0)
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-display font-bold text-lg text-white group-hover:text-hxh-blue transition-colors truncate">
                  {char.name}
                </span>
                {activeCharId === char.id && (
                  <ShieldCheck className="text-hxh-green flex-shrink-0 ml-2" size={18} />
                )}
              </div>
              <div className="flex gap-3 text-xs font-mono text-gray-400 uppercase tracking-tighter">
                <span>Andar {char.floor}</span>
                <span>·</span>
                <span className="text-hxh-blue">{char.nenType}</span>
                <span>·</span>
                <span>Nível {char.level}</span>
              </div>
            </div>

            {activeCharId === char.id && (
              <div className="absolute inset-0 border-2 border-hxh-green animate-pulse rounded-lg pointer-events-none opacity-20" />
            )}
          </button>
        ))}
      </div>

      {isCompetitor && dbChars.length >= 2 && (
        <div className="mt-4 bg-hxh-blue/5 border border-hxh-blue/20 p-4 rounded-lg flex items-start gap-3">
          <Info className="text-hxh-blue shrink-0 mt-0.5" size={16} />
          <p className="text-gray-400 text-xs">
            Limite de personagens atingido (2/2). Selecione um perfil acima para entrar na arena.
          </p>
        </div>
      )}
    </div>
  );
};
