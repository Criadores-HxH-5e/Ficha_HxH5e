import React, { useState, useEffect } from 'react';
import { INITIAL_CHARACTER, DISCORD_ROLES } from './constants.ts';
import { ProfileManager } from './components/ProfileManager.tsx';
import { Character, DiscordUser } from './types.ts';
import { CharacterHeader } from './components/CharacterHeader.tsx';
import { BettingTerminal } from './components/BettingTerminal.tsx';
import { CompetitorDashboard } from './components/CompetitorDashboard.tsx';
import { OtherCompetitors } from './components/OtherCompetitors.tsx';
import { DiscordLogin } from './components/DiscordLogin.tsx';
import { ModeSelector } from './components/ModeSelector.tsx';
import { V2Dashboard } from './components/v2/V2Dashboard.tsx';
import { User, Dices, Users, LogOut, LayoutGrid } from 'lucide-react';
import { loadSession, clearSession, supabase, type SessionUser } from './src/supabase.ts';

export interface SbFighter {
  id: string;
  name: string;
  image_url?: string | null;
  floor?: number;
  nen_type?: string;
}

// HxH5e escreve 'hxh_hunter_session' no localStorage compartilhado ao fazer login.
// Torre lê na inicialização e pula a tela de login automaticamente.

function App() {
  const [discordUser, setDiscordUser] = useState<SessionUser | null>(() => loadSession());
  const [mode, setMode]       = useState<'BETTOR' | 'FIGHTER' | 'OTHERS' | 'PROFILES'>('PROFILES');
  const [appView, setAppView] = useState<'SELECT' | 'CLASSIC' | 'NEW'>('SELECT');

  const [character, setCharacter]   = useState<Character>(INITIAL_CHARACTER);
  const [activeCharId, setActiveCharId] = useState<string | null>(null);

  // Fighters do Supabase para o seletor de personagem no header
  const [sbFighters, setSbFighters] = useState<SbFighter[]>([]);
  const [activeSbFighterId, setActiveSbFighterId] = useState<string | null>(null);

  useEffect(() => {
    if (!discordUser) return;
    supabase
      .from('tc_fighters')
      .select('id, name, image_url, floor, nen_type')
      .eq('owner_id', `discord:${discordUser.id}`)
      .then(({ data }) => setSbFighters((data as SbFighter[]) || []));
  }, [discordUser?.id]);

  const userRoles  = discordUser?.roles || [];
  const isJudge    = DISCORD_ROLES.JUDGE.some((id: string) => userRoles.includes(id));
  const isInvestor = DISCORD_ROLES.INVESTOR.some((id: string) => userRoles.includes(id));

  const handleLogin = (user: SessionUser) => {
    setDiscordUser(user);
    setAppView('SELECT');
  };

  const handleLogout = () => {
    clearSession();
    setDiscordUser(null);
    setCharacter(INITIAL_CHARACTER);
    setActiveCharId(null);
    setSbFighters([]);
    setActiveSbFighterId(null);
    setMode('PROFILES');
    setAppView('SELECT');
  };

  // V1: seleção de personagem (agora recebe o objeto inteiro do banco)
  const handleCharacterSelect = (char: Character) => {
    setCharacter(char);
    setActiveCharId(char.id);
    setMode('BETTOR');
  };

  const updateWallet = (updates: Partial<Character>) => {
    setCharacter(prev => ({ ...prev, ...updates }));
  };

  if (!discordUser) {
    return <DiscordLogin onLogin={handleLogin} />;
  }

  if (appView === 'SELECT') {
    return <ModeSelector userName={discordUser.username} onSelect={setAppView} onLogout={handleLogout} />;
  }

  if (appView === 'NEW') {
    return <V2Dashboard discordUser={discordUser} onBack={() => setAppView('SELECT')} onLogout={handleLogout} />;
  }

  // ── V1 Classic ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-20 bg-[#050505] text-gray-200 selection:bg-hxh-green selection:text-black font-body">
      <CharacterHeader
        character={character}
        mode={mode === 'FIGHTER' ? 'FIGHTER' : 'BETTOR'}
        discordUser={discordUser as unknown as DiscordUser}
        onSwitchMode={() => setAppView('SELECT')}
        sbFighters={sbFighters}
        activeSbFighterId={activeSbFighterId}
        onSbFighterSelect={setActiveSbFighterId}
      />

      <main className="max-w-7xl mx-auto mt-6 px-4">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex gap-4 w-full max-w-sm">
            <button
              onClick={() => setMode('BETTOR')}
              className={`flex-1 py-3 flex items-center justify-center gap-3 font-display font-bold text-lg tracking-widest uppercase transition-all duration-300 rounded-lg border-2 ${
                mode === 'BETTOR'
                  ? 'bg-hxh-green text-black border-hxh-green shadow-[0_0_20px_rgba(0,255,65,0.4)] scale-105'
                  : 'bg-gray-900/50 text-gray-500 border-gray-700 hover:text-white hover:border-gray-500'
              }`}
            >
              <Dices size={24} /> Investidor
            </button>
            <button
              onClick={() => setMode('PROFILES')}
              className={`flex-1 py-3 flex items-center justify-center gap-3 font-display font-bold text-lg tracking-widest uppercase transition-all duration-300 rounded-lg border-2 ${
                mode === 'PROFILES'
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105'
                  : 'bg-gray-900/50 text-gray-500 border-gray-700 hover:text-white hover:border-gray-500'
              }`}
            >
              <LayoutGrid size={24} /> Perfis
            </button>
          </div>

          <div className="flex gap-4 w-full max-w-sm">
            <button
              onClick={() => setMode('FIGHTER')}
              disabled={!activeCharId}
              className={`flex-1 py-2 flex items-center justify-center gap-2 font-display font-bold text-sm tracking-wider uppercase transition-all duration-300 rounded border ${
                !activeCharId ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                mode === 'FIGHTER'
                  ? 'bg-hxh-blue text-black border-hxh-blue shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'bg-gray-900/50 text-gray-500 border-gray-800 hover:text-white hover:border-gray-600'
              }`}
            >
              <User size={16} /> Competidor
            </button>

            {isJudge && (
              <button
                onClick={() => setMode('OTHERS')}
                className={`flex-1 py-2 flex items-center justify-center gap-2 font-display font-bold text-sm tracking-wider uppercase transition-all duration-300 rounded border ${
                  mode === 'OTHERS'
                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                    : 'bg-gray-900/50 text-gray-500 border-gray-800 hover:text-white hover:border-gray-600'
                }`}
              >
                <Users size={16} /> Painel
              </button>
            )}
          </div>
        </div>

        <div className="animate-fade-in">
          {mode === 'PROFILES' && (
            <ProfileManager
              discordUserId={discordUser.id}
              activeCharId={activeCharId}
              onSelect={handleCharacterSelect}
              isCompetitor={isInvestor}
            />
          )}
          {mode === 'BETTOR' && (
            <BettingTerminal character={character} onUpdateWallet={updateWallet} discordUser={discordUser as unknown as DiscordUser} />
          )}
          {mode === 'FIGHTER' && (
            <CompetitorDashboard character={character} onUpdate={updateWallet} />
          )}
          {mode === 'OTHERS' && (
            <OtherCompetitors discordUser={discordUser as unknown as DiscordUser} />
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-900 flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors uppercase font-mono text-xs tracking-widest px-4 py-2 border border-transparent hover:border-red-900/30 rounded"
          >
            <LogOut size={14} /> Encerrar Sessão do Terminal
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
