import React, { useState, useEffect } from 'react';
import { Character, LiveMatch, TowerFloorData, DiscordUser, InvestmentRecord } from '../types.ts';
import { TOWER_FLOOR_DATA, DISCORD_CONFIG, ADMIN_CONFIG, TOWER_TAX_RATE, INVESTMENTS_TO_UNLOCK_TRAINING } from '../constants.ts';
import { Swords, DollarSign, Lock, Unlock, Info, Radar, Activity, Wifi, Gavel, Wallet, Calculator, ArrowDownLeft, ArrowUpRight, Dumbbell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArenaNotification } from './ArenaNotification.tsx';
import { PaymentModal } from './PaymentModal.tsx';
import { firebaseService } from '../services/firebaseService';
const auth = { currentUser: null };
import { COMPETITORS_LIST } from '../src/competitors';

interface Props {
  character: Character;
  onUpdateWallet: (updates: Partial<Character>) => void;
  discordUser: DiscordUser | null;
}

// Initial Mock Match (can be null now)
const INITIAL_MATCH: LiveMatch | null = null;

export const BettingTerminal: React.FC<Props> = ({ character, onUpdateWallet, discordUser }) => {
  // State
  const [match, setMatch] = useState<LiveMatch | null>(INITIAL_MATCH);
  const [wager, setWager] = useState<number>(0);
  const [selectedFighterId, setSelectedFighterId] = useState<string | null>(null);
  const [realHistory, setRealHistory] = useState<InvestmentRecord[]>([]);
  
  // Notification State
  const [notification, setNotification] = useState<{ active: boolean, message: string }>({ active: false, message: '' });

  // Payment State
  const [paymentMode, setPaymentMode] = useState<'DEPOSIT' | 'WITHDRAW' | null>(null);

  // Judge Mode State
  const isJudge = discordUser && ADMIN_CONFIG.ADMIN_IDS.includes(discordUser.id);
  const [judgeForm, setJudgeForm] = useState({
    fighterAName: '',
    fighterADiscordId: '',
    fighterBName: '',
    fighterBDiscordId: '',
    floor: 1
  });

  // Discord Bot / Socket Connection Effect
  useEffect(() => {
    // Lógica de Conexão com o Bot para RECEBER dados
    if (DISCORD_CONFIG.INBOUND_API_URL) {
        console.log(`Tentando conectar ao bot em: ${DISCORD_CONFIG.INBOUND_API_URL}`);
    }
  }, []);

  // Firebase Live Match Subscription
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToLiveMatch((liveMatch) => {
      setMatch(prevMatch => {
        // Only update if the match data actually changed or if it's a new match
        if (JSON.stringify(prevMatch) !== JSON.stringify(liveMatch)) {
          if (liveMatch && prevMatch?.id !== liveMatch.id) {
            setSelectedFighterId(null);
          }
          return liveMatch;
        }
        return prevMatch;
      });
    });
    return () => unsubscribe();
  }, []); // Empty dependency array for stable subscription

  // Firebase History Subscription
  useEffect(() => {
    if (auth.currentUser) {
      const targetId = auth.currentUser.uid;
      const unsubscribe = firebaseService.subscribeToInvestments(targetId, (investments) => {
        setRealHistory(investments);
      });
      return () => unsubscribe();
    }
  }, [auth.currentUser]);

  // HOUSE EDGE CALCULATION
  const totalPool = match ? match.fighterA.totalPool + match.fighterB.totalPool : 0;
  // The house takes a cut (e.g. 10%) from the total pool before calculating odds.
  const netPool = totalPool * (1 - TOWER_TAX_RATE);
  
  const oddsA = match && totalPool > 0 ? (netPool / Math.max(match.fighterA.totalPool, 1)) : 1.0;
  const oddsB = match && totalPool > 0 ? (netPool / Math.max(match.fighterB.totalPool, 1)) : 1.0;

  // Formatting Odds to never show less than 1.01x visually, though math might result in loss if pool is heavily skewed + tax
  const displayOddsA = Math.max(1.01, oddsA);
  const displayOddsB = Math.max(1.01, oddsB);  // Find Floor Data
  const floorData: TowerFloorData | undefined = match ? TOWER_FLOOR_DATA.find(
      d => match.floor >= d.minFloor && match.floor <= d.maxFloor
  ) : undefined;
  
  const minInvest = floorData ? floorData.investMin : 50;
  const maxInvestLimit = floorData ? floorData.investMax : 1000000;
  
  // Total usable balance is Real + Training
  const totalBalance = character.jenny + character.trainingJenny;
  const effectiveMaxInvest = Math.min(totalBalance, maxInvestLimit);

  // Initialize wager when match starts
  useEffect(() => {
     if (match && wager < minInvest) setWager(Math.min(minInvest, effectiveMaxInvest));
  }, [match?.id]);

  // Simulate Live Betting (The "Hype" Factor)
  useEffect(() => {
    if (!match || match.status !== 'OPEN') return;

    const interval = setInterval(() => {
        setMatch(prev => {
            if (!prev) return null;
            const addToA = Math.random() > 0.4 ? Math.floor(Math.random() * 50000) : 0;
            const addToB = Math.random() > 0.4 ? Math.floor(Math.random() * 50000) : 0;
            return {
                ...prev,
                fighterA: { ...prev.fighterA, totalPool: prev.fighterA.totalPool + addToA },
                fighterB: { ...prev.fighterB, totalPool: prev.fighterB.totalPool + addToB }
            };
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [match?.status]);

  // JUDGE ACTIONS
  const handleJudgeStartMatch = async () => {
    if (!judgeForm.fighterAName || !judgeForm.fighterBName) {
        alert("Preencha os nomes dos lutadores!");
        return;
    }

    const newMatch: LiveMatch = {
        id: `match_${Date.now()}`,
        floor: judgeForm.floor,
        status: 'OPEN',
        fighterA: {
            id: 'fa',
            name: judgeForm.fighterAName,
            imageUrl: `https://picsum.photos/seed/${judgeForm.fighterAName}/400/600`, 
            totalPool: 100000 // Seed pool
        },
        fighterB: {
            id: 'fb',
            name: judgeForm.fighterBName,
            imageUrl: `https://picsum.photos/seed/${judgeForm.fighterBName}/400/600`,
            totalPool: 100000 // Seed pool
        }
    };

    // Save to Firebase (Real-time sync for everyone)
    await firebaseService.createMatch(newMatch);
    
    setNotification({ active: true, message: `COMBATE SANCIONADO: ${newMatch.fighterA.name} VS ${newMatch.fighterB.name}` });

    if (DISCORD_CONFIG.OUTBOUND_WEBHOOK_URL) {
        try {
            // Auto-lookup IDs from list if not manually provided
            const autoIdA = COMPETITORS_LIST.find(c => c.name === judgeForm.fighterAName)?.id;
            const autoIdB = COMPETITORS_LIST.find(c => c.name === judgeForm.fighterBName)?.id;
            
            const finalIdA = judgeForm.fighterADiscordId || autoIdA;
            const finalIdB = judgeForm.fighterBDiscordId || autoIdB;

            // Format floor range for display
            let floorDisplay = `${newMatch.floor}`;
            const floorData = TOWER_FLOOR_DATA.find(f => newMatch.floor >= f.minFloor && newMatch.floor <= f.maxFloor);
            if (floorData) {
                floorDisplay = newMatch.floor === 251 ? "251 (Topo)" : `${floorData.minFloor}-${floorData.maxFloor}`;
            }

            await fetch(DISCORD_CONFIG.OUTBOUND_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: null,
                    embeds: [{
                        title: "📢 PREPARADOS PARA UM X1?",
                        description: `UMA GRANDE BATALHA IRÁ COMEÇAR!\n\nSenhoras e senhores, nesse dia de hoje ${finalIdA ? `<@${finalIdA}>` : `**${newMatch.fighterA.name}**`} e ${finalIdB ? `<@${finalIdB}>` : `**${newMatch.fighterB.name}**`} entrarão em um feroz combate nos Andares **${floorDisplay}** buscando subir na Torre Celestial e garantir seu lugar no topo!\n\n<@&1100984179845505044> Agitem o canal de apostas! 💸 #logs 🤑\n\n*Abaixo estão marcados os competidores:* ${finalIdA ? `<@${finalIdA}>` : ''} ${finalIdB ? `<@${finalIdB}>` : ''}`,
                        color: 3447003,
                        image: {
                            url: "https://www.icegif.com/wp-content/uploads/2022/01/icegif-1082.gif"
                        },
                        thumbnail: {
                            url: "https://images5.fanpop.com/image/photos/30500000/Heaven-s-Arena-hunter-x-hunter-30544757-926-457.jpg"
                        },
                        footer: { text: "Heaven's Gate Terminal • Investimentos Abertos" },
                        timestamp: new Date().toISOString()
                    }]
                })
            });
        } catch (e) {
            console.error("Webhook error", e);
        }
    }
  };

  const handleJudgeEndMatch = async (winnerId: string | null) => {
      if (!match) return;
      
      const winnerName = winnerId === match.fighterA.id ? match.fighterA.name : (winnerId === match.fighterB.id ? match.fighterB.name : "Nenhum (Empate/Cancelado)");
      
      // Update Firebase
      await firebaseService.updateMatch({ 
          status: 'FINISHED', 
          winnerId: winnerId || undefined 
      });

      setNotification({ active: true, message: `COMBATE ENCERRADO. VENCEDOR: ${winnerName}` });
      
      if (DISCORD_CONFIG.OUTBOUND_WEBHOOK_URL) {
          try {
             await fetch(DISCORD_CONFIG.OUTBOUND_WEBHOOK_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      content: `🛑 **COMBATE ENCERRADO!**`,
                      embeds: [{
                          title: "🏆 RESULTADO OFICIAL",
                          description: `O combate no **${match.floor}º Andar** chegou ao fim!`,
                          color: winnerId ? 16776960 : 8421504, // Gold or Gray
                          fields: [
                              { name: "Vencedor", value: `**${winnerName}**`, inline: true },
                              { name: "Juiz", value: discordUser?.username || "Unknown", inline: true }
                          ],
                          footer: { text: "Os lucros foram processados e creditados aos investidores vencedores." },
                          timestamp: new Date().toISOString()
                      }]
                  })
              });
          } catch(e) {}
      }

      setTimeout(async () => {
          await firebaseService.clearMatch();
      }, 5000);
  };

  const handlePlaceInvestment = async () => {
      if (!match) return;
      if (wager > totalBalance) {
          alert("Fundos Insuficientes!");
          return;
      }
      if (wager < minInvest) {
          alert(`Investimento mínimo para este andar é ${minInvest} TC Coin`);
          return;
      }

      if (!selectedFighterId) return;

      const isA = selectedFighterId === match.fighterA.id;
      const fighterName = isA ? match.fighterA.name : match.fighterB.name;
      const odds = isA ? displayOddsA : displayOddsB;

      // --- LOGIC START ---
      let currentTraining = character.trainingJenny;
      let currentReal = character.jenny;
      let wagerRemaining = wager;

      // 1. Deduct from Training First
      if (currentTraining > 0) {
          if (currentTraining >= wagerRemaining) {
              currentTraining -= wagerRemaining;
              wagerRemaining = 0;
          } else {
              wagerRemaining -= currentTraining;
              currentTraining = 0;
          }
      }

      // 2. Deduct remaining from Real
      if (wagerRemaining > 0) {
          currentReal -= wagerRemaining;
      }

      // 3. Increment Investments Count
      const newInvestmentsPlaced = character.investmentsPlaced + 1;
      let unlockedTrainingBonus = 0;

      // 4. Check for Unlock Condition
      if (newInvestmentsPlaced === INVESTMENTS_TO_UNLOCK_TRAINING) {
          if (currentTraining > 0) {
              unlockedTrainingBonus = currentTraining;
              currentReal += currentTraining;
              currentTraining = 0;
              setNotification({ active: true, message: `PARABÉNS! Saldo de Treino (${unlockedTrainingBonus} TC Coin) foi DESBLOQUEADO para uso Real!` });
          }
      }

      // Update Local State for Optimism
      onUpdateWallet({
          jenny: currentReal,
          trainingJenny: currentTraining,
          investmentsPlaced: newInvestmentsPlaced
      });

      // Save Investment to Firebase
      // IMPORTANTE: Usamos o ownerId do personagem ou o UID do Firebase, pois as regras exigem que userId == request.auth.uid
      const userId = character.ownerId;
      if (userId) {
          await firebaseService.placeInvestment(userId, {
              matchId: match.id,
              fighterId: selectedFighterId,
              fighterName: fighterName,
              amount: wager,
              odds: odds,
              result: 'PENDING',
              timestamp: new Date().toISOString()
          });
      }

      // Update Match Pools
      setMatch(prev => {
        if (!prev) return null;
        return {
          ...prev,
          fighterA: { ...prev.fighterA, totalPool: prev.fighterA.totalPool + (isA ? wager : 0) },
          fighterB: { ...prev.fighterB, totalPool: prev.fighterB.totalPool + (!isA ? wager : 0) },
        }
      });

        // Discord Webhook
        if (DISCORD_CONFIG.OUTBOUND_WEBHOOK_URL) {
            try {
                await fetch(DISCORD_CONFIG.OUTBOUND_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: `💸 **NOVO INVESTIMENTO!**\nO mercado está se movendo para o combate no **${match.floor}º Andar**!`,
                        embeds: [{
                            title: "🎰 MOVIMENTAÇÃO DE ODDS",
                            color: 5763719,
                            description: `**${character.name}** acabou de investir **${wager.toLocaleString()} TC Coin** em **${fighterName}**!`,
                            fields: [
                                { name: "Lutador", value: fighterName, inline: true },
                                { name: "Odds Atuais", value: `**${odds.toFixed(2)}x**`, inline: true },
                                { name: "Andar", value: `${match.floor}º`, inline: true }
                            ],
                            footer: { text: "As odds mudam em tempo real conforme novos investimentos entram!" },
                            timestamp: new Date().toISOString()
                        }]
                    })
                });
            } catch (error) {
                console.error("Erro ao enviar webhook para Discord:", error);
            }
        }

      alert(`Investimento realizado em ${fighterName}! ${unlockedTrainingBonus > 0 ? `\nSaldo de Treino Desbloqueado!` : ''}`);
      setSelectedFighterId(null);
  };

  const chartData = realHistory.map(bet => ({
      name: bet.fighterName,
      amount: bet.amount,
      result: bet.result,
      profit: bet.result === 'WIN' ? (bet.amount * (bet.odds || 1)) - bet.amount : -bet.amount
  }));

  const handleTransaction = (amountJenny: number) => {
      // Deposits always go to Real Jenny
      // Withdrawals (negative amount) come from Real Jenny
      onUpdateWallet({ jenny: character.jenny + amountJenny });
  };

  return (
    <>
    {paymentMode && (
        <PaymentModal 
            mode={paymentMode} 
            character={character}
            onClose={() => setPaymentMode(null)} 
            onConfirm={handleTransaction} 
        />
    )}

    <ArenaNotification 
        message={notification.message} 
        isActive={notification.active} 
        onDismiss={() => setNotification(n => ({ ...n, active: false }))} 
    />

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 h-full animate-fade-in relative">
      
      {/* JUDGE PANEL (ONLY VISIBLE TO ADMINS) */}
      {isJudge && (
        <div className="lg:col-span-12 bg-yellow-900/20 border border-yellow-600/50 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between mb-4 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
            {/* ... Existing Judge Panel ... */}
            <div className="flex items-center gap-3 text-yellow-500 font-display font-bold uppercase tracking-wider">
                <Gavel size={24} />
                Painel do Juiz de Andar
            </div>
            
            {!match ? (
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div className="flex flex-col gap-1">
                        <input 
                            list="competitors-list"
                            placeholder="Nome Lutador A" 
                            className="bg-black/50 border border-yellow-800 text-white px-3 py-1 rounded text-xs outline-none focus:border-yellow-500 w-32"
                            value={judgeForm.fighterAName}
                            onChange={e => setJudgeForm(prev => ({...prev, fighterAName: e.target.value}))}
                        />
                        <input 
                            placeholder="ID Discord A (Opcional)" 
                            className="bg-black/50 border border-yellow-900 text-gray-400 px-2 py-0.5 rounded text-[10px] outline-none focus:border-yellow-500 w-32"
                            value={judgeForm.fighterADiscordId}
                            onChange={e => setJudgeForm(prev => ({...prev, fighterADiscordId: e.target.value}))}
                        />
                    </div>
                    
                    <span className="text-yellow-600 font-bold self-center">VS</span>
                    
                    <div className="flex flex-col gap-1">
                        <input 
                            list="competitors-list"
                            placeholder="Nome Lutador B" 
                            className="bg-black/50 border border-yellow-800 text-white px-3 py-1 rounded text-xs outline-none focus:border-yellow-500 w-32"
                            value={judgeForm.fighterBName}
                            onChange={e => setJudgeForm(prev => ({...prev, fighterBName: e.target.value}))}
                        />
                        <input 
                            placeholder="ID Discord B (Opcional)" 
                            className="bg-black/50 border border-yellow-900 text-gray-400 px-2 py-0.5 rounded text-[10px] outline-none focus:border-yellow-500 w-32"
                            value={judgeForm.fighterBDiscordId}
                            onChange={e => setJudgeForm(prev => ({...prev, fighterBDiscordId: e.target.value}))}
                        />
                    </div>

                    <datalist id="competitors-list">
                        {COMPETITORS_LIST.map(c => (
                            <option key={c.id || c.name} value={c.name} />
                        ))}
                    </datalist>
                    
                    <select 
                        className="bg-black/50 border border-yellow-800 text-white px-3 py-1 rounded text-sm outline-none focus:border-yellow-500 h-fit self-center"
                        value={judgeForm.floor}
                        onChange={e => setJudgeForm(prev => ({...prev, floor: Number(e.target.value)}))}
                    >
                        {TOWER_FLOOR_DATA.map(f => (
                            <option key={f.minFloor} value={f.minFloor}>
                                {f.minFloor === 251 ? "Andar 251" : `Andares ${f.minFloor}-${f.maxFloor}`}
                            </option>
                        ))}
                    </select>
                    
                    <button 
                        onClick={handleJudgeStartMatch}
                        className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-4 py-1 rounded text-sm transition-colors uppercase h-fit self-center"
                    >
                        Sancionar
                    </button>
                </div>
            ) : (
                <div className="flex gap-4 items-center">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleJudgeEndMatch(match.fighterA.id)}
                            className="bg-hxh-blue hover:bg-hxh-blue/80 text-black font-bold px-4 py-1 rounded text-xs uppercase"
                        >
                            Vitória {match.fighterA.name}
                        </button>
                        <button 
                            onClick={() => handleJudgeEndMatch(match.fighterB.id)}
                            className="bg-hxh-accent hover:bg-hxh-accent/80 text-black font-bold px-4 py-1 rounded text-xs uppercase"
                        >
                            Vitória {match.fighterB.name}
                        </button>
                    </div>
                    <button 
                        onClick={() => handleJudgeEndMatch(null)}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-1 rounded text-xs transition-colors uppercase flex items-center gap-2"
                    >
                        <Lock size={14} /> Encerrar s/ Vencedor
                    </button>
                </div>
            )}
        </div>
      )}

      {/* LEFT COLUMN: HISTORY & WALLET & CURRENT MATCH STATUS (4 cols) */}
      <div className="lg:col-span-4 space-y-6 flex flex-col">
        
        {/* CURRENT MATCH CARD (Mini) */}
        <div className={`bg-hxh-panel border border-gray-800 p-4 rounded-lg relative overflow-hidden transition-all duration-500 ${match ? 'border-hxh-green/50 shadow-[0_0_15px_rgba(0,255,65,0.1)]' : 'opacity-70'}`}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center justify-between">
                <span>Status da Arena</span>
                <Wifi size={14} className={match ? "text-green-500" : "text-gray-600"} />
            </h3>
            
            {match ? (
                <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                         <span className="text-red-500 font-bold animate-pulse text-xs">● AO VIVO</span>
                         <span className="bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded border border-gray-700">{match.floor}º ANDAR</span>
                    </div>
                    <div className="flex items-center justify-between text-white font-display font-bold text-sm">
                        <span className="truncate w-1/2">{match.fighterA.name}</span>
                        <span className="text-hxh-green mx-2 text-xs">VS</span>
                        <span className="truncate w-1/2 text-right">{match.fighterB.name}</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-hxh-green h-full animate-progress-indeterminate" />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-2 text-gray-500 gap-2">
                    <Radar className="animate-spin-slow text-gray-700" size={24} />
                    <span className="text-[10px] uppercase tracking-wider">Aguardando Sinal...</span>
                </div>
            )}
        </div>

        {/* Wallet */}
        <div className="bg-hxh-panel border border-hxh-green/30 p-6 rounded-lg shadow-[0_0_15px_rgba(0,255,65,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <DollarSign size={100} />
            </div>
            
            <div className="flex justify-between items-start mb-2 relative z-10">
                <h2 className="text-gray-400 text-xs uppercase font-bold tracking-widest flex items-center gap-2">
                    Carteira Hunter
                </h2>
                
                <div className="flex gap-2">
                    {/* Botão Depósito: Seta apontando para saldo (Baixo/Esquerda) */}
                    <button 
                        onClick={() => setPaymentMode('DEPOSIT')}
                        className="bg-hxh-green text-black p-1.5 rounded hover:scale-110 transition-transform shadow-[0_0_10px_rgba(0,255,65,0.4)] flex items-center justify-center"
                        title="Depositar (R$ -> TC Coin)"
                    >
                        <Wallet size={16} className="absolute opacity-20" />
                        <ArrowDownLeft size={16} strokeWidth={3} />
                    </button>

                    {/* Botão Saque: Seta apontando para fora (Cima/Direita) */}
                    <button 
                        onClick={() => setPaymentMode('WITHDRAW')}
                        className="bg-white text-black p-1.5 rounded hover:scale-110 transition-transform shadow-[0_0_10px_rgba(255,255,255,0.4)] flex items-center justify-center"
                        title="Convert Hands (TC Coin -> R$)"
                    >
                        <Wallet size={16} className="absolute opacity-20" />
                        <ArrowUpRight size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>
            
            <div className="relative z-10 space-y-1 my-3">
                {/* LINHA 1: TREINO (Se houver saldo) */}
                {character.trainingJenny > 0 && (
                    <div className="flex items-center justify-between text-yellow-500/80">
                        <span className="text-xs uppercase flex items-center gap-1 font-bold tracking-wider"><Dumbbell size={10} /> Treino</span>
                        <span className="font-display font-bold tracking-widest text-lg">{character.trainingJenny.toLocaleString()} TC Coin</span>
                    </div>
                )}
                
                {/* LINHA 2: REAL */}
                <div className="flex items-center justify-between text-white">
                    <span className="text-xs uppercase flex items-center gap-1 font-bold tracking-wider text-hxh-green"><DollarSign size={10} /> Real</span>
                    <span className="font-display font-bold tracking-widest text-2xl text-shadow-green">{character.jenny.toLocaleString()} TC Coin</span>
                </div>
            </div>

            {/* Investment Progress Bar */}
            {character.investmentsPlaced < INVESTMENTS_TO_UNLOCK_TRAINING && character.trainingJenny > 0 && (
                <div className="relative z-10 mt-2">
                    <div className="flex justify-between text-[8px] uppercase text-gray-500 mb-1">
                        <span>Desbloqueio de Treino</span>
                        <span>{character.investmentsPlaced}/{INVESTMENTS_TO_UNLOCK_TRAINING} Investimentos</span>
                    </div>
                    <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                        <div 
                            className="bg-yellow-500 h-full transition-all duration-500" 
                            style={{ width: `${(character.investmentsPlaced / INVESTMENTS_TO_UNLOCK_TRAINING) * 100}%` }} 
                        />
                    </div>
                </div>
            )}
            
            <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-wide">
                <Calculator size={10} /> Taxa da Torre: {(TOWER_TAX_RATE * 100)}% sobre prêmios
            </div>
        </div>

        {/* History Graph */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex-1 flex flex-col min-h-[300px]">
            {/* ... Existing Chart ... */}
            <h3 className="text-white font-display text-sm mb-4 border-l-4 border-hxh-green pl-2 uppercase tracking-wider">
                Histórico de Investimentos
            </h3>
            {chartData.length > 0 ? (
                <div className="flex-1 min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#666' }} interval={0} />
                            <YAxis tick={{ fontSize: 10, fill: '#666' }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                formatter={(value: any) => [`${(value as number)?.toLocaleString() || '0'} TC Coin`, 'Valor']}
                            />
                            <Bar dataKey="amount">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.result === 'WIN' ? '#00ff41' : '#ff003c'} fillOpacity={0.8} />
                            ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-600 opacity-50">
                    <Activity size={32} className="mb-2" />
                    <span className="text-xs uppercase">Sem registros</span>
                </div>
            )}
        </div>
      </div>

      {/* RIGHT COLUMN: LIVE MATCH OR WAITING SCREEN */}
      {/* ... Existing Match UI ... */}
      <div className="lg:col-span-8 flex flex-col h-full bg-black border-2 border-gray-800 rounded-xl overflow-hidden relative shadow-2xl min-h-[500px]">
         
         {match ? (
             // ACTIVE MATCH UI
             <>
                 {/* Live Header */}
                 <div className="absolute top-0 w-full z-20 flex justify-between items-start p-4 pointer-events-none">
                     <div className="bg-red-600 text-white px-3 py-1 font-bold text-xs uppercase tracking-widest animate-pulse shadow-lg skew-x-[-10deg]">
                         AO VIVO • {match.floor}º ANDAR
                     </div>
                     <div className="bg-gray-900/80 backdrop-blur border border-gray-700 text-gray-300 px-3 py-1 font-mono text-xs rounded">
                         POOL: <span className="text-hxh-green font-bold">{totalPool.toLocaleString()} TC Coin</span>
                     </div>
                 </div>

                 {/* VS Background Split */}
                 <div className="flex-1 flex flex-col md:flex-row relative">
                     
                     {/* FIGHTER A */}
                     <div 
                        className={`flex-1 relative group cursor-pointer border-r border-gray-800 transition-all duration-500 overflow-hidden
                        ${selectedFighterId === match.fighterA.id ? 'flex-[1.5] brightness-110' : 'flex-1 brightness-75 hover:brightness-100'}
                        ${selectedFighterId && selectedFighterId !== match.fighterA.id ? 'grayscale opacity-50' : ''}
                        `}
                        onClick={() => setSelectedFighterId(match.fighterA.id)}
                     >
                         <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${match.fighterA.imageUrl})` }} />
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
                         
                         <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black to-transparent">
                             <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter mb-2" style={{ textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>
                                 {match.fighterA.name}
                             </h2>
                             <div className="flex items-center justify-between">
                                 <div>
                                    <p className="text-gray-400 text-xs font-mono mb-1">ODDS (Net)</p>
                                    <p className="text-4xl font-bold text-hxh-blue">{displayOddsA.toFixed(2)}x</p>
                                 </div>
                             </div>
                         </div>
                         {selectedFighterId === match.fighterA.id && (
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                                 <div className="inline-block px-6 py-2 bg-hxh-blue text-black font-black text-xl uppercase tracking-widest skew-x-[-10deg]">SELECIONADO</div>
                             </div>
                         )}
                     </div>

                     {/* FIGHTER B */}
                     <div 
                        className={`flex-1 relative group cursor-pointer border-l border-gray-800 transition-all duration-500 overflow-hidden
                        ${selectedFighterId === match.fighterB.id ? 'flex-[1.5] brightness-110' : 'flex-1 brightness-75 hover:brightness-100'}
                        ${selectedFighterId && selectedFighterId !== match.fighterB.id ? 'grayscale opacity-50' : ''}
                        `}
                        onClick={() => setSelectedFighterId(match.fighterB.id)}
                     >
                         <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${match.fighterB.imageUrl})` }} />
                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

                         <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black to-transparent text-right">
                             <h2 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter mb-2" style={{ textShadow: '0 0 20px rgba(0,0,0,0.8)' }}>
                                 {match.fighterB.name}
                             </h2>
                             <div className="flex items-center justify-between flex-row-reverse">
                                 <div>
                                    <p className="text-gray-400 text-xs font-mono mb-1">ODDS (Net)</p>
                                    <p className="text-4xl font-bold text-hxh-accent">{displayOddsB.toFixed(2)}x</p>
                                 </div>
                             </div>
                         </div>
                         {selectedFighterId === match.fighterB.id && (
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                                 <div className="inline-block px-6 py-2 bg-hxh-accent text-black font-black text-xl uppercase tracking-widest skew-x-[-10deg]">SELECIONADO</div>
                             </div>
                         )}
                     </div>
                     
                     {/* VS Center Icon */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                         <div className="w-16 h-16 bg-black border-2 border-hxh-green rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(0,255,65,0.3)]">
                            <Swords size={24} className="text-white -rotate-45" />
                         </div>
                     </div>
                 </div>

                 {/* Betting Controls */}
                 <div className="bg-hxh-panel border-t border-gray-800 p-4 z-20">
                     <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-500 uppercase tracking-wider justify-center md:justify-start">
                         <Info size={12} />
                         <span>Limites do Andar {match.floor}: Min {minInvest.toLocaleString()} TC Coin / Max {maxInvestLimit.toLocaleString()} TC Coin</span>
                     </div>

                     <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                         <div className="flex items-center gap-4 w-full md:w-auto">
                             <span className="text-gray-400 font-bold text-sm uppercase">Valor Investimento:</span>
                             <input 
                                 type="range" 
                                 min={minInvest} 
                                 max={effectiveMaxInvest}
                                 step="50" 
                                 value={wager}
                                 onChange={(e) => setWager(Number(e.target.value))}
                                 className="flex-1 md:w-48 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-hxh-green"
                             />
                             <div className="bg-black border border-gray-700 px-3 py-1 text-white font-mono rounded min-w-[100px] text-center">
                                 {wager.toLocaleString()} TC Coin
                             </div>
                         </div>
                         <button 
                            onClick={handlePlaceInvestment}
                            disabled={!selectedFighterId || match.status !== 'OPEN'}
                            className={`
                                px-8 py-3 font-bold uppercase tracking-wider text-sm transition-all clip-path-polygon flex items-center gap-2 w-full md:w-auto justify-center
                                ${!selectedFighterId 
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                    : 'bg-hxh-green text-black hover:bg-white hover:scale-105 shadow-[0_0_15px_rgba(0,255,65,0.4)]'}
                            `}
                         >
                             {match.status === 'OPEN' ? <><Unlock size={16}/> CONFIRMAR INVESTIMENTO</> : <><Lock size={16}/> FECHADO</>}
                         </button>
                     </div>
                 </div>
             </>
         ) : (
             // NO MATCH / WAITING SCREEN
             <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-900/20 text-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
                 <Radar size={80} className="text-gray-800 mb-6 animate-pulse" />
                 <h2 className="text-2xl font-display font-bold text-gray-500 uppercase tracking-widest mb-2 z-10">
                     Nenhum combate detectado
                 </h2>
                 <p className="text-gray-600 font-mono text-sm max-w-md z-10">
                     Aguardando sinal da Torre Celestial. O terminal será atualizado automaticamente quando uma nova luta for sancionada.
                 </p>
                 <div className="mt-8 flex items-center gap-2 text-hxh-green/50 text-xs uppercase tracking-widest animate-pulse z-10">
                     <div className="w-2 h-2 rounded-full bg-hxh-green" /> Conectado ao Servidor Central
                 </div>
             </div>
         )}
      </div>

    </div>
    </>
  );
};