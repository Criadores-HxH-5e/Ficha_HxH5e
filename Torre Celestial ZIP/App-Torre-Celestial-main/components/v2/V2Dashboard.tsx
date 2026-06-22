import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  History, 
  DollarSign, 
  ArrowLeft,
  ChevronRight,
  Zap,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  CheckCircle,
  Gavel,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  HelpCircle,
  Hash,
  Terminal,
  Webhook,
  X,
  LogOut,
  Crown,
  ChevronLeft,
  Wallet,
  PieChart,
  Anchor,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { v2Service } from '../../src/services/v2Service';
import { 
    V2CoinsManagerModal, 
    V2RegisterFighterModal,
    V2JudgeRegisterModal,
    V2ResetArenaModal,
    V2EditFighterModal
} from './V2EconomyModals';
import { ADMIN_CONFIG, APP_VERSION } from '../../constants';

interface V2DashboardProps {
  discordUser: any;
  onBack: () => void;
  onLogout: () => void;
}

export const V2Dashboard: React.FC<V2DashboardProps> = ({ discordUser, onBack, onLogout }) => {
  const [userData, setUserData] = useState<any>(null);
  const [fighters, setFighters] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [npcMatches, setNpcMatches] = useState<any[]>([]);
  const [allFights, setAllFights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [backupSlot, setBackupSlot] = useState(1);
  const [selectedFloorGroup, setSelectedFloorGroup] = useState('1-9');
  const prevMatchesRef = useRef<any[]>([]);

  // Request Notification Permissions
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Browser Notifications Logic
  useEffect(() => {
    if (npcMatches.length > 0 && prevMatchesRef.current.length > 0) {
      npcMatches.forEach(match => {
        const prevMatch = prevMatchesRef.current.find(m => m.id === match.id);
        
        // Novo combate agendado
        if (!prevMatch && match.status === 'SCHEDULED') {
          if (Notification.permission === "granted") {
            new Notification("🎰 TORRE CELESTIAL: NOVO COMBATE NPC", {
              body: `Duelo no ${match.floor_range} entre ${match.fighter_a_name} vs ${match.fighter_b_name}. Invista antes que o tempo acabe!`,
              icon: "https://i.imgur.com/GisLInR.png"
            });
          }
        }
        
        // Combate Finalizado
        if (prevMatch && prevMatch.status !== 'FINISHED' && match.status === 'FINISHED') {
          const winnerName = match.winner_id === match.fighter_a_id ? match.fighter_a_name : match.fighter_b_name;
          if (Notification.permission === "granted") {
            new Notification("🏁 TORRE CELESTIAL: RESULTADO NPC", {
              body: `O combate NPC no ${match.floor_range} acabou! Vencedor: ${winnerName}.`,
              icon: "https://i.imgur.com/GisLInR.png"
            });
          }
        }
      });
    }
    prevMatchesRef.current = npcMatches;
  }, [npcMatches]);
  
  // Modal States
  const [selectedFighter, setSelectedFighter] = useState<any>(null);
  const [showManager, setShowManager] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showJudgeRegister, setShowJudgeRegister] = useState(false);
  const [showResetArena, setShowResetArena] = useState(false);
  const [activeSection, setActiveSection] = useState<'MARKET' | 'JUDGE' | 'INVESTMENTS'>('MARKET');
  const [fighterToEdit, setFighterToEdit] = useState<any>(null);
  const [showSanctionForm, setShowSanctionForm] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [marketSubTab, setMarketSubTab] = useState<'ALL' | '1-49' | '50-149' | '150-199' | '200+' | 'MASTERS'>('1-49');
  const [judgeSubSection, setJudgeSubSection] = useState<'FIGHTERS' | 'FINANCE'>('FIGHTERS');
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [appNotifications, setAppNotifications] = useState<any[]>([]);
  const [judgeSort, setJudgeSort] = useState<{ field: string, order: 'asc' | 'desc' }>({ field: 'name', order: 'asc' });
  const PAGE_SIZE = 10;

  const addNotification = (title: string, message: string, type: 'SUCCESS' | 'ERROR' | 'INFO' = 'INFO') => {
    const id = `local-${Math.random().toString(36).substring(2, 9)}`;
    const newNote = { id, title, message, type, isLocal: true };
    setAppNotifications(prev => [newNote, ...prev].slice(0, 5));
  };

  const normalizedUserId = discordUser?.id?.startsWith('discord:') ? discordUser.id.replace('discord:', '') : discordUser?.id;
  const isJudge = userData?.is_admin || 
                  ADMIN_CONFIG.ADMIN_IDS.includes(normalizedUserId) || 
                  (discordUser?.roles?.some((r: string) => ["1100415887971991572", "1263215631784869949", "1335940980628521000"].includes(r)));
  const isSuperAdmin = normalizedUserId === "513323323355037717";

  useEffect(() => {
    if (!discordUser) return;

    // Check version to force synchronization on new deployments
    const lastSessionVersion = localStorage.getItem('v2_terminal_version');
    if (lastSessionVersion && lastSessionVersion !== APP_VERSION) {
        console.warn(`[V2-SYNC] Nova versão detectada: ${APP_VERSION} (Anterior: ${lastSessionVersion}). Sincronizando...`);
        localStorage.setItem('v2_terminal_version', APP_VERSION);
        // Clean session and reload to ensure all hooks and backend sync are updated correctly
        onLogout();
        window.location.reload();
        return;
    }
    localStorage.setItem('v2_terminal_version', APP_VERSION);

    // Initialize Profile
    v2Service.initProfile(discordUser.id, discordUser.global_name || discordUser.username)
      .then(data => {
        if (data.error) {
          console.error("[V2-DASH] Erro ao inicializar perfil:", data.error);
          setInitError(data.error);
        } else {
          setUserData(data);
          setInitError(null);
        }
      })
      .catch(err => {
        console.error("[V2-DASH] Erro fatal na chamada initProfile:", err);
        setInitError("Erro de conexão com o servidor de dados.");
      })
      .finally(() => {
        setLoading(false);
      });

    // Real-time Subscriptions with error handling
    const handleError = (context: string) => (err: any) => {
        console.error(`[V2-SYNC] Erro em ${context}:`, err);
        if (err.code === 'permission-denied') {
            console.warn(`[V2-SYNC] Acesso negado em ${context}. Verificando estado de autenticação...`);
        }
    };

    const unsubUser = v2Service.subscribeToV2User(discordUser.id, setUserData, handleError('User Profile'));
    const unsubFighters = v2Service.subscribeToFighters(setFighters, handleError('Fighters'));
    const unsubQuotes = v2Service.subscribeToQuotes(discordUser.id, setQuotes, handleError('Quotes'));
    const unsubTransactions = v2Service.subscribeToTransactions(discordUser.id, setTransactions, handleError('Transactions'));
    const unsubNPCMatches = v2Service.subscribeToNPCMatches(setNpcMatches, handleError('NPC Matches'));
    const unsubAllFights = v2Service.subscribeToFights(setAllFights, handleError('All Fights History'));
    const unsubNotifications = v2Service.subscribeToNotifications(discordUser.id, setAppNotifications, handleError('Notifications'));

    let unsubPendingTransactions = () => {};
    if (isJudge) {
      unsubPendingTransactions = v2Service.subscribeToPendingTransactions(setPendingTransactions, handleError('Pending Transactions'));
    }

    // Auto-resolve pending matches occasionally
    v2Service.resolveNPCMatches().catch(console.error);

    return () => {
      unsubUser();
      unsubFighters();
      unsubQuotes();
      unsubTransactions();
      unsubNPCMatches();
      unsubAllFights();
      unsubNotifications();
      unsubPendingTransactions();
    };
  }, [discordUser]);

  const filteredQuotes = quotes.filter(q => fighters.some(f => f.id === q.fighter_id));
  const totalPortfolioValue = filteredQuotes.reduce((acc, q) => {
    const fighter = fighters.find(f => f.id === q.fighter_id);
    return acc + (q.amount * (fighter?.quote_value || 0));
  }, 0);

  if (loading || (!userData && !initError)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-hxh-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-hxh-blue font-mono text-xs animate-pulse tracking-widest uppercase">
            {loading ? 'Iniciando Sincronização Torre Celestial - Ascenção...' : 'Finalizando conexão segura...'}
          </p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-6 max-w-sm">
          <div className="w-16 h-16 bg-red-900/20 border border-red-500 rounded-full flex items-center justify-center text-red-500">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-white font-display font-bold text-xl uppercase tracking-wider">Falha na Identificação</h2>
            <p className="text-gray-400 text-sm font-mono">{initError}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded uppercase tracking-widest transition-all"
          >
            Tentar Novamente
          </button>
          <button 
            onClick={onLogout}
            className="text-gray-500 hover:text-white text-xs uppercase underline"
          >
            Sair e Logar Novamente
          </button>
        </div>
      </div>
    );
  }

  const userFighter = fighters.find(f => f.user_id === discordUser.id);
  const isFighterVerified = !!userFighter;

  const handleDeleteFighter = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja EXPULSAR ${name} da arena? Esta ação é irreversível.`)) return;
    try {
      const res = await v2Service.deleteFighter(id);
      if (res.error) throw new Error(res.error);
      alert(`Lutador ${name} foi expulso com sucesso!`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDismissNotification = async (id: string) => {
    setAppNotifications(prev => prev.filter(n => n.id !== id));
    try {
        await v2Service.markNotificationsRead([id]);
    } catch (e) {
        console.error("Erro ao marcar notificação como lida:", e);
    }
  };

    const handleRandomizeNPC = async () => {
        setIsRandomizing(true);
        try {
            const res = await v2Service.runNPCMatchmaking(discordUser.id, isJudge, selectedFloorGroup);
            if (res.error) throw new Error(res.error);
            alert("Combate NPC agendado com sucesso! Veja na lista abaixo.");
        } catch (e: any) {
            alert(`Erro no Matchmaking: ${e.message}`);
        } finally {
            setIsRandomizing(false);
        }
    };

    const handleRecalculateFighters = async () => {
        if (!confirm("Deseja recalcular o valor de TODOS os lutadores com a nova matriz? Isso sincronizará os preços de mercado.")) return;
        setIsRecalculating(true);
        try {
            const res = await v2Service.recalculateAllFighters(discordUser.id, isJudge);
            if (res.error) throw new Error(res.error);
            alert(res.message);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsRecalculating(false);
        }
    };

    const handleBackup = async (slot: number) => {
        if (!confirm(`Confirmar Backup dos lutadores no SLOT ${slot}?`)) return;
        setIsBackingUp(true);
        try {
            const res = await v2Service.backupFighters(discordUser.id, slot);
            if (res.error) throw new Error(res.error);
            addNotification('ÂNCORA', `Estado dos lutadores salvo com sucesso no Slot ${slot}.`, 'SUCCESS');
        } catch (e: any) {
            addNotification('ERRO', `Falha ao fixar Âncora: ${e.message}`, 'ERROR');
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleRestore = async (slot: number) => {
        if (!confirm(`Deseja restaurar o estado dos lutadores do SLOT ${slot}? O estado atual será perdido.`)) return;
        setIsRestoring(true);
        try {
            const res = await v2Service.restoreFighters(discordUser.id, slot);
            if (res.error) throw new Error(res.error);
            addNotification('ÂNCORA', `A Torre retornou ao estado salvo no Slot ${slot}.`, 'SUCCESS');
        } catch (e: any) {
            addNotification('ERRO', `Falha ao restaurar Âncora: ${e.message}`, 'ERROR');
        } finally {
            setIsRestoring(false);
        }
    };

    const handleMassExplosion = async () => {
        if (!confirm("AVISO: Isso irá gerar combates em massa em todos os andares da torre. Deseja iniciar o Duelo em Massa?")) return;
        setIsExploding(true);
        try {
            const rounds = 5; // Simular 5 rodadas
            for (let i = 0; i < rounds; i++) {
                const res = await v2Service.runMassTest(discordUser.id);
                if (res.error) throw new Error(res.error);
                // Pequeno delay para visualização
                await new Promise(r => setTimeout(r, 2000));
            }
            addNotification('SISTEMA', "DUELO EM MASSA CONCLUÍDO: Centenas de combates simulados. Verifique os novos andares e valorizações.", 'SUCCESS');
        } catch (e: any) {
            addNotification('ERRO', `Falha no Duelo em Massa: ${e.message}`, 'ERROR');
        } finally {
            setIsExploding(false);
        }
    };

    const handleProcessTransaction = async (txId: string, status: 'APPROVE' | 'REJECT') => {
        let reason = '';
        if (status === 'REJECT') {
            const tx = pendingTransactions.find(t => t.id === txId);
            const defaultPrompt = tx?.type === 'DEPOSIT' ? 'REJEITADO POR PAGAMENTO NÃO IDENTIFICADO' : 'Motivação padrão de recusa por Auditoria Hunter.';
            const r = prompt('Informe o motivo da rejeição (Opcional):', defaultPrompt);
            if (r === null) return; // Cancelled
            reason = r || defaultPrompt;
        }
        
        try {
            const res = await v2Service.processPendingTransaction(discordUser.id, txId, status, reason);
            if (res.error) throw new Error(res.error);
        } catch (e: any) {
            alert(`Erro na Auditoria: ${e.message}`);
        }
    };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-hxh-blue selection:text-white pb-24 overflow-x-hidden relative">
      <div className="relative z-10">
        {/* PERSISTENT HEADER */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-6">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft size={18} className="md:w-5 md:h-5" />
          </button>
          <div className="hidden sm:block">
            <h1 className="text-lg md:text-xl font-display font-black italic uppercase tracking-tighter flex items-center gap-2 leading-none">
              Torre Celestial <span className="text-hxh-blue">- Ascenção</span>
            </h1>
            <p className="text-[8px] md:text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] mt-1">Terminal Estratégico da Torre Celestial</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <p className="text-[8px] md:text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5 md:mb-1">Saldo Total</p>
                    <div className="flex items-center gap-1.5 md:gap-2 justify-end">
                        <span className="text-lg md:text-xl font-mono font-black text-white">
                            {(userData?.coins_balance || 0).toLocaleString('pt-BR')}
                        </span>
                        <Zap size={12} className="fill-gray-400 text-gray-400" />
                    </div>
                </div>
                <div className="text-right border-l border-white/10 pl-3">
                    <p className="text-[8px] md:text-[10px] text-hxh-blue uppercase font-bold tracking-wider mb-0.5 md:mb-1">Liberado</p>
                    <div className="flex items-center gap-1.5 md:gap-2 justify-end">
                        <span className="text-lg md:text-xl font-mono font-black text-hxh-blue/80">
                            {(userData?.released_balance || 0).toLocaleString('pt-BR')}
                        </span>
                        <ShieldCheck size={12} className="text-hxh-blue/80" />
                    </div>
                </div>
                <button 
                    onClick={() => setShowManager(true)}
                    className="p-1.5 md:p-2 bg-hxh-blue/10 border border-hxh-blue/30 text-hxh-blue rounded hover:bg-hxh-blue/10 hover:text-white transition-all group ml-1"
                    title="Gerenciar TC Coin"
                >
                    <TrendingUp size={14} className="md:w-4 md:h-4 group-hover:scale-110 transition-transform" />
                </button>
            </div>
            <div className="h-8 md:h-10 w-px bg-white/10 hidden xs:block"></div>
            <div className="flex items-center gap-2 md:gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold leading-none">{userData?.name}</p>
                    <p className="text-[10px] text-hxh-blue uppercase tracking-widest font-mono mt-1">
                        {isFighterVerified ? 'Lutador' : 'Hunter'}
                    </p>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-hxh-blue/30 overflow-hidden bg-hxh-blue/10 flex items-center justify-center">
                    {discordUser.avatar ? (
                        <img 
                            src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : <Users size={18} className="text-hxh-blue" />}
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all group"
                  title="Encerrar Sessão"
                >
                  <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </div>
      </header>

      {/* SECTION NAV */}
      <nav className="max-w-7xl mx-auto px-4 md:px-6 mt-6 flex gap-3 overflow-x-auto pb-4 no-scrollbar border-b border-white/5">
        <button 
          onClick={() => setActiveSection('INVESTMENTS')}
          className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all flex items-center gap-2 border ${activeSection === 'INVESTMENTS' ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-black/40 text-gray-500 border-white/5 hover:border-white/20'}`}
        >
          <Wallet size={14} /> Investimentos da Torre
        </button>
        <button 
          onClick={() => setActiveSection('MARKET')}
          className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all flex items-center gap-2 border ${activeSection === 'MARKET' ? 'bg-hxh-blue text-white border-hxh-blue shadow-[0_0_20px_rgba(33,150,243,0.3)]' : 'bg-black/40 text-gray-500 border-white/5 hover:border-white/20'}`}
        >
          <TrendingUp size={14} /> Mercado de Lutadores
        </button>
        {isJudge && (
          <button 
            onClick={() => setActiveSection('JUDGE')}
            className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all flex items-center gap-2 border ${activeSection === 'JUDGE' ? 'bg-red-600 text-white border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-black/40 text-gray-500 border-white/5 hover:border-white/20'}`}
          >
             <Gavel size={14} /> Painel de Juiz
          </button>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 md:mt-8 pb-20">
         {activeSection === 'INVESTMENTS' && (
             <div className="space-y-8 animate-fade-in">
                 {/* SUMMARY CARDS */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <PieChart size={64} />
                        </div>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 font-bold">Patrimônio em Cotas</p>
                        <div className="flex items-center gap-2 text-2xl font-mono font-black">
                            <Zap size={20} className="text-hxh-blue" />
                            {totalPortfolioValue.toLocaleString('pt-BR')}
                        </div>
                        <p className="text-[9px] text-gray-600 mt-2 uppercase font-mono tracking-tighter">Baseado no valor atual de mercado</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group border-l-hxh-blue/30 border-l-4">
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 font-bold">Saldo TC Coin</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-2xl font-mono font-black text-hxh-blue">
                                <Zap size={20} />
                                {userData?.coins_balance?.toLocaleString('pt-BR')}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                            <div className="text-[8px] uppercase font-mono text-gray-500">
                                Liberado: <span className="text-white ml-1 font-bold">{userData?.released_balance?.toLocaleString()}</span>
                            </div>
                            <div className="text-[8px] uppercase font-mono text-gray-500">
                                Bloqueado: <span className="text-yellow-500 ml-1 font-bold">{(Math.max(0, (userData?.coins_balance || 0) - (userData?.released_balance || 0))).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowManager(true)}
                        className="bg-hxh-blue/10 border border-hxh-blue/20 rounded-2xl p-6 hover:bg-hxh-blue/20 transition-all text-left flex flex-col justify-between group"
                    >
                        <div className="flex items-center justify-between mb-4">
                           <Shield size={20} className="text-hxh-blue group-hover:scale-110 transition-transform" />
                           <ChevronRight size={16} className="text-hxh-blue group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div>
                            <h3 className="font-display font-black uppercase italic text-lg text-white">Gerenciar TC Coin</h3>
                            <p className="text-[9px] text-gray-400 font-mono uppercase tracking-widest mt-1">Sacar ou Depositar Jenny</p>
                        </div>
                    </button>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                         <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mb-3 text-gray-400">
                            <TrendingUp size={20} />
                         </div>
                         <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Status do Mercado</p>
                         <p className="text-xs text-[#00ff41] font-mono font-black animate-pulse uppercase tracking-tighter">Operacional / Alta Demanda</p>
                    </div>
                 </div>

                 {/* TRANSACTION HISTORY */}
                 <section className="bg-white/5 border border-white/10 rounded-[2rem] p-6 lg:p-8">
                     <div className="flex items-center gap-3 mb-8">
                         <div className="w-10 h-10 bg-hxh-blue/10 rounded-xl flex items-center justify-center text-hxh-blue">
                            <History size={20} />
                         </div>
                         <div>
                            <h2 className="text-xl font-display font-black uppercase italic tracking-tighter">Histórico de <span className="text-hxh-blue">Atividade</span></h2>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Logs de Transações e Movimentações</p>
                         </div>
                     </div>

                     <div className="overflow-x-auto">
                         <table className="w-full text-left font-mono text-[10px] border-collapse">
                             <thead>
                                <tr className="border-b border-white/5 text-gray-500 uppercase tracking-widest">
                                    <th className="py-4 px-2">Data/Hora</th>
                                    <th className="py-4 px-2">Protocolo</th>
                                    <th className="py-4 px-2">Lutador / Detalhes</th>
                                    <th className="py-4 px-2 text-right">Valor</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-gray-600 uppercase tracking-widest italic opacity-40">Nenhuma atividade registrada</td>
                                    </tr>
                                ) : (
                                    transactions.map(tx => (
                                        <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="py-4 px-2 text-gray-500 whitespace-nowrap">
                                                {tx.timestamp ? new Date(tx.timestamp.seconds * 1000).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Sincronizando...'}
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black ${
                                                    tx.type === 'BUY_QUOTE' ? 'bg-hxh-blue/10 text-hxh-blue' : 
                                                    tx.type === 'SELL_QUOTE' ? 'bg-red-500/10 text-red-500' :
                                                    'bg-green-500/10 text-green-500'
                                                }`}>
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2 text-gray-300">
                                                {tx.metadata?.fighterId?.split('____')[1]?.replace(/_/g, ' ') || tx.type.replace(/_/g, ' ')}
                                                {tx.metadata?.amount && <span className="text-[8px] text-gray-600 block mt-0.5">{tx.metadata.amount} cotas</span>}
                                            </td>
                                            <td className={`py-4 px-2 text-right font-bold text-sm ${
                                                tx.type === 'BUY_QUOTE' ? 'text-red-500/80' : 'text-[#00ff41]'
                                            }`}>
                                                {tx.type === 'BUY_QUOTE' ? '-' : '+'}{tx.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                             </tbody>
                         </table>
                     </div>
                 </section>
             </div>
         )}

        {activeSection === 'MARKET' && (
            <div className="space-y-8 animate-fade-in">
                {/* SEARCH & FILTERS */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-display font-black uppercase italic tracking-tighter">Mercado de <span className="text-hxh-blue">Lutadores</span></h2>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">Conectado ao Terminal Central da Associação Hunter</p>
                        </div>
                        <button 
                            onClick={() => setShowRegister(true)}
                            className="w-fit px-4 py-2 bg-hxh-blue/10 text-hxh-blue border border-hxh-blue/30 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 transition-all hover:bg-hxh-blue/20"
                        >
                            <Plus size={12} /> Cadastrar Lutador
                        </button>
                    </div>

                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-hxh-blue transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder="Buscar lutador por nome..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-mono focus:outline-none focus:border-hxh-blue/50 focus:bg-hxh-blue/5 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* FLOOR GROUP TABS */}
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                    {[
                        { id: 'ALL' as const, label: 'Todos' },
                        { id: '1-49' as const, label: 'Andares 1-49' },
                        { id: '50-149' as const, label: 'Andares 50-149' },
                        { id: '150-199' as const, label: 'Andares 150-199' },
                        { id: '200+' as const, label: 'Andares 200+' },
                        { id: 'MASTERS' as const, label: 'Mestres de Andar' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setMarketSubTab(tab.id); setCurrentPage(1); }}
                            className={`whitespace-nowrap px-6 py-3 rounded-xl font-display font-black uppercase text-[10px] italic tracking-widest transition-all border ${
                                marketSubTab === tab.id 
                                    ? 'bg-hxh-blue border-hxh-blue text-white shadow-[0_0_20px_rgba(33,150,243,0.3)] scale-105' 
                                    : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:border-white/20'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-start gap-4">
                    <Crown size={20} className="text-yellow-500 shrink-0 mt-1" />
                    <div>
                        <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Protocolo Mestre de Andar (200+)</p>
                        <p className="text-[9px] text-gray-500 font-mono leading-relaxed mt-1">Lutadores acima do andar 200 que alcançarem <strong className="text-white">10 vitórias seguidas contra oponentes do andar 200+</strong> (ou 10 vitórias com menos de 4 derrotas totais) conquistam permissão para <strong className="text-white">Desafiar um Mestre de Andar</strong> e reivindicar seu título.</p>
                    </div>
                </div>

                {/* FIGHTERS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {fighters.length === 0 ? (
                        <div className="col-span-full py-32 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-gray-600">
                            <Activity size={64} className="mb-4 opacity-10 animate-pulse" />
                            <p className="font-mono text-sm uppercase tracking-[0.3em]">Scanner da Torre Inativo</p>
                        </div>
                    ) : (() => {
                        const filtered = fighters.filter(f => {
                            const nameMatch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
                            const idMatch = f.id.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchesSearch = nameMatch || idMatch;
                            if (!matchesSearch) return false;

                            const fFloor = f.floor || 1;
                            const masters = [210, 220, 230, 240, 250, 251];
                            const isMaster = masters.includes(fFloor);

                            if (marketSubTab === 'ALL') return true;
                            if (marketSubTab === '1-49') return fFloor <= 49;
                            if (marketSubTab === '50-149') return fFloor >= 50 && fFloor <= 149;
                            if (marketSubTab === '150-199') return fFloor >= 150 && fFloor <= 199;
                            if (marketSubTab === '200+') return fFloor >= 200 && !isMaster;
                            if (marketSubTab === 'MASTERS') return isMaster;
                            
                            return true;
                        });

                        if (marketSubTab === 'ALL') {
                            filtered.sort((a, b) => a.name.localeCompare(b.name));
                        }
                        
                        const start = (currentPage - 1) * PAGE_SIZE;
                        const pageFighters = filtered.slice(start, start + PAGE_SIZE);
                        
                        if (pageFighters.length === 0) return (
                            <div className="col-span-full py-24 text-center">
                                <Search size={32} className="mx-auto mb-4 text-gray-700" />
                                <p className="uppercase font-mono text-[10px] text-gray-500 tracking-[0.2em]">Nenhum lutador ativo nesta categoria.</p>
                            </div>
                        );

                        return pageFighters.map(fighter => (
                            <FighterCard 
                                key={fighter.id} 
                                fighter={fighter} 
                                onClick={() => setSelectedFighter(fighter)}
                                userQuote={quotes.find(q => q.fighter_id === fighter.id)}
                                isOwner={fighter.user_id === discordUser.id}
                            />
                        ));
                    })()}
                </div>

                {/* PAGINATION */}
                {(() => {
                    const filtered = fighters.filter(f => {
                        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
                        if (!matchesSearch) return false;

                        const fFloor = f.floor || 1;
                        const masters = [210, 220, 230, 240, 250, 251];
                        const isMaster = masters.includes(fFloor);

                        if (marketSubTab === '1-49') return fFloor <= 49;
                        if (marketSubTab === '50-149') return fFloor >= 50 && fFloor <= 149;
                        if (marketSubTab === '150-199') return fFloor >= 150 && fFloor <= 199;
                        if (marketSubTab === '200+') return fFloor >= 200 && !isMaster;
                        if (marketSubTab === 'MASTERS') return isMaster;
                        
                        return true;
                    });
                    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
                    if (totalPages <= 1) return null;

                    return (
                        <div className="flex items-center justify-center gap-4 mt-12">
                             <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-3 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                             >
                                <ChevronLeft size={20} />
                             </button>
                             <div className="flex items-center gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-xl font-mono text-xs font-bold transition-all border ${currentPage === i+1 ? 'bg-hxh-blue border-hxh-blue text-white shadow-[0_0_20px_rgba(33,150,243,0.3)]' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                             </div>
                             <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-3 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                             >
                                <ChevronRight size={20} />
                             </button>
                        </div>
                    );
                })()}
            </div>
        )}

        {activeSection === 'JUDGE' && (
            <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 lg:p-10 animate-fade-in min-h-[600px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                    <Gavel size={200} />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-6 relative z-10 border-b border-white/5 pb-8">
                    <div>
                        <h2 className="text-3xl font-display font-black uppercase italic tracking-tighter text-hxh-blue">Painel</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <button 
                                onClick={() => setJudgeSubSection('FIGHTERS')}
                                className={`text-[10px] font-mono uppercase tracking-widest transition-all ${judgeSubSection === 'FIGHTERS' ? 'text-hxh-blue font-black' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                • Cadastro de Lutadores
                            </button>
                            {isSuperAdmin && (
                                <button 
                                    onClick={() => setJudgeSubSection('FINANCE')}
                                    className={`text-[10px] font-mono uppercase tracking-widest transition-all relative ${judgeSubSection === 'FINANCE' ? 'text-hxh-blue font-black' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    • Auditoria Financeira
                                    {pendingTransactions.length > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-bounce">
                                            {pendingTransactions.length}
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={() => setShowRegister(true)}
                            className="px-6 py-3 bg-hxh-blue/10 text-hxh-blue border border-hxh-blue/30 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all hover:bg-hxh-blue/20"
                        >
                            <Plus size={14} /> Cadastrar Lutador
                        </button>
                        
                        {isSuperAdmin && (
                            <button 
                                onClick={handleRandomizeNPC}
                                disabled={isRandomizing}
                                className="px-6 py-3 bg-hxh-blue/10 text-hxh-blue border border-hxh-blue/30 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all hover:bg-hxh-blue/20 disabled:opacity-50"
                            >
                                <RefreshCw size={14} className={isRandomizing ? 'animate-spin' : ''} /> Randomizar NPC
                            </button>
                        )}

                        {isSuperAdmin && (
                            <button 
                                onClick={handleRecalculateFighters}
                                disabled={isRecalculating}
                                className="px-6 py-3 bg-hxh-blue/10 text-hxh-blue border border-hxh-blue/30 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all hover:bg-hxh-blue/20 disabled:opacity-50"
                            >
                                <TrendingUp size={14} className={isRecalculating ? 'animate-pulse' : ''} /> Recalcular Valores
                            </button>
                        )}

                        {isSuperAdmin && (
                            <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-2xl p-1">
                                <div className="flex flex-col gap-1 px-2">
                                    <label className="text-[7px] text-gray-500 uppercase font-black px-1">Slot Ancora</label>
                                    <select 
                                        value={backupSlot}
                                        onChange={(e) => setBackupSlot(Number(e.target.value))}
                                        className="bg-transparent text-[10px] text-white font-mono outline-none border-none cursor-pointer"
                                        disabled={isBackingUp || isRestoring}
                                    >
                                        <option className="bg-[#0a0a0a]" value={1}>SLOT 01</option>
                                        <option className="bg-[#0a0a0a]" value={2}>SLOT 02</option>
                                        <option className="bg-[#0a0a0a]" value={3}>SLOT 03</option>
                                    </select>
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleBackup(backupSlot)}
                                        disabled={isBackingUp || isRestoring}
                                        className="p-2.5 bg-hxh-blue/10 text-hxh-blue hover:bg-hxh-blue/20 rounded-xl transition-all disabled:opacity-30"
                                        title="Fixar Âncora (Backup)"
                                    >
                                        <Anchor size={14} className={isBackingUp ? 'animate-bounce' : ''} />
                                    </button>
                                    <button 
                                        onClick={() => handleRestore(backupSlot)}
                                        disabled={isBackingUp || isRestoring}
                                        className="p-2.5 bg-hxh-blue/10 text-hxh-blue hover:bg-hxh-blue/20 rounded-xl transition-all disabled:opacity-30"
                                        title="Retornar Âncora (Restore)"
                                    >
                                        <RotateCcw size={14} className={isRestoring ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {isSuperAdmin && (
                            <button 
                                onClick={handleMassExplosion}
                                disabled={isExploding}
                                className="px-6 py-3 bg-red-600/10 text-red-600 border border-red-600/30 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all hover:bg-red-600/20 disabled:opacity-50 group"
                            >
                                <Zap size={14} className={isExploding ? 'animate-pulse text-white' : 'group-hover:text-white'} /> Duelo em Massa
                            </button>
                        )}

                        <button 
                            onClick={() => setShowSanctionForm(!showSanctionForm)}
                            className={`px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 ${
                                showSanctionForm ? 'bg-white text-black shadow-xl' : 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 shadow-red-500/30'
                            }`}
                        >
                            <Terminal size={14} /> {showSanctionForm ? 'Lista de Lutadores' : 'Cadastrar Combate'}
                        </button>
                    </div>
                </div>

                {judgeSubSection === 'FIGHTERS' ? (
                    <>
                    {showSanctionForm ? (
                        <div className="animate-fade-in">
                            <V2SanctionMatchForm 
                                fighters={fighters} 
                                judgeName={discordUser.global_name || discordUser.username}
                                onSuccess={() => setShowSanctionForm(false)}
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                        <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <th 
                                                className="pb-4 pr-4 cursor-pointer hover:text-white transition-colors"
                                                onClick={() => setJudgeSort(p => ({ field: 'name', order: p.field === 'name' && p.order === 'asc' ? 'desc' : 'asc' }))}
                                            >
                                                Lutador {judgeSort.field === 'name' && (judgeSort.order === 'asc' ? '↑' : '↓')}
                                            </th>
                                            <th 
                                                className="pb-4 px-4 hidden md:table-cell cursor-pointer hover:text-white transition-colors"
                                                onClick={() => setJudgeSort(p => ({ field: 'floor', order: p.field === 'floor' && p.order === 'desc' ? 'asc' : 'desc' }))}
                                            >
                                                Andar {judgeSort.field === 'floor' && (judgeSort.order === 'desc' ? '↓' : '↑')}
                                            </th>
                                            <th 
                                                className="pb-4 px-4 cursor-pointer hover:text-white transition-colors"
                                                onClick={() => setJudgeSort(p => ({ field: 'popularity', order: p.field === 'popularity' && p.order === 'desc' ? 'asc' : 'desc' }))}
                                            >
                                                Popularidade {judgeSort.field === 'popularity' && (judgeSort.order === 'desc' ? '↓' : '↑')}
                                            </th>
                                            <th 
                                                className="pb-4 px-4 cursor-pointer hover:text-white transition-colors"
                                                onClick={() => setJudgeSort(p => ({ field: 'quote_value', order: p.field === 'quote_value' && p.order === 'desc' ? 'asc' : 'desc' }))}
                                            >
                                                Valor {judgeSort.field === 'quote_value' && (judgeSort.order === 'desc' ? '↓' : '↑')}
                                            </th>
                                            <th className="pb-4 pl-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[...fighters].sort((a, b) => {
                                            const { field, order } = judgeSort;
                                            if (field === 'name') {
                                                return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
                                            }
                                            const valA = a[field] || 0;
                                            const valB = b[field] || 0;
                                            return order === 'asc' ? valA - valB : valB - valA;
                                        }).map(f => (
                                    <tr key={f.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-black">
                                                    <img src={f.imageUrl} className="w-full h-full object-cover object-top" referrerPolicy="no-referrer" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase italic">{f.name}</p>
                                                    <p className="text-[8px] text-gray-500 font-mono">
                                                        {f.nenType === 'Enhancement' ? 'Reforço' : 
                                                         f.nenType === 'Transmutation' ? 'Transmutação' :
                                                         f.nenType === 'Emission' ? 'Emissão' :
                                                         f.nenType === 'Conjuration' ? 'Materialização' :
                                                         f.nenType === 'Manipulation' ? 'Manipulação' :
                                                         f.nenType === 'Specialization' ? 'Especialização' :
                                                         'Não Desperto'} • Nv {f.level}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 hidden md:table-cell">
                                            <span className="font-mono text-xs">{f.floor}º {f.floor <= 9 ? '(1-9)' : 
                                                f.floor <= 19 ? '(10-19)' : 
                                                f.floor <= 29 ? '(20-29)' : 
                                                f.floor <= 39 ? '(30-39)' : 
                                                f.floor <= 49 ? '(40-49)' : 
                                                f.floor <= 59 ? '(50-59)' : 
                                                f.floor <= 69 ? '(60-69)' :
                                                f.floor <= 79 ? '(70-79)' :
                                                f.floor <= 89 ? '(80-89)' :
                                                f.floor <= 99 ? '(90-99)' :
                                                f.floor <= 109 ? '(100-109)' :
                                                f.floor <= 119 ? '(110-119)' :
                                                f.floor <= 129 ? '(120-129)' :
                                                f.floor <= 139 ? '(130-139)' :
                                                f.floor <= 149 ? '(140-149)' :
                                                f.floor <= 159 ? '(150-159)' :
                                                f.floor <= 169 ? '(160-169)' :
                                                f.floor <= 179 ? '(170-179)' :
                                                f.floor <= 189 ? '(180-189)' :
                                                f.floor <= 199 ? '(190-199)' :
                                                '(200+)'}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1">
                                                <Activity size={10} className="text-hxh-blue" />
                                                <span className="font-mono text-xs">{f.popularity}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-mono text-xs text-hxh-blue">{f.quote_value?.toLocaleString()} TC Coin</span>
                                        </td>
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => setFighterToEdit(f)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteFighter(f.id, f.name)}
                                                    className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded transition-all"
                                                    title="Excluir via App"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                                {isSuperAdmin && (
                                                    <a 
                                                        href={`https://console.firebase.google.com/project/gen-lang-client-0675955892/firestore/databases/ai-studio-b16b75c6-a438-43ce-8913-24f7046a995f/data/~2Fv2_fighters~2F${f.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-hxh-blue/60 hover:text-hxh-blue hover:bg-hxh-blue/10 rounded transition-all flex items-center justify-center"
                                                        title="Abrir no Firebase Console (Exclusão Manual)"
                                                    >
                                                        <ExternalLink size={14} />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {fighters.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-gray-600 font-mono text-[10px] uppercase tracking-[0.3em]">
                                            Nenhum registro encontrado para auditoria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    )}

                    <div className="mt-12 space-y-8 border-t border-white/5 pt-12">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <History size={20} className="text-hxh-blue" />
                                <h3 className="text-lg font-display font-black uppercase italic tracking-tighter">Histórico de Combates</h3>
                            </div>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Últimos 50 confrontos na arena</p>
                        </div>
                        
                        <div className="space-y-6">
                            {(() => {
                                const grouped = allFights.reduce((acc: any, fight: any) => {
                                    const date = fight.timestamp?.seconds 
                                        ? new Date(fight.timestamp.seconds * 1000).toLocaleDateString('pt-BR')
                                        : 'Aguardando...';
                                    if (!acc[date]) acc[date] = [];
                                    acc[date].push(fight);
                                    return acc;
                                }, {});

                                return Object.entries(grouped).map(([date, fights]: [string, any]) => (
                                    <div key={date} className="space-y-3">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{date}</span>
                                            <div className="h-px flex-1 bg-white/5"></div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {fights.map((fight: any) => {
                                                const fA = fighters.find(f => f.id === fight.fighter_a_id);
                                                const fB = fighters.find(f => f.id === fight.fighter_b_id);
                                                const winner = fighters.find(f => f.id === fight.winner_id);
                                                
                                                return (
                                                    <div key={fight.id} className="bg-white/5 hover:bg-white/[0.08] transition-colors rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 group">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                                                                fight.type === 'NPC_AUTO' ? 'text-purple-400 bg-purple-400/10' : 'text-blue-400 bg-blue-400/10'
                                                            }`}>
                                                                {fight.type === 'NPC_AUTO' ? 'NPC' : 'JUÍZ'}
                                                            </span>
                                                            <div className="flex items-center gap-2 truncate">
                                                                <span className={`text-xs font-bold uppercase truncate ${fight.winner_id === fight.fighter_a_id ? 'text-hxh-blue' : 'text-white/60'}`}>
                                                                    {fA?.name || 'Lutador Desconhecido'}
                                                                </span>
                                                                <span className="text-[10px] font-black text-gray-700 italic">VS</span>
                                                                <span className={`text-xs font-bold uppercase truncate ${fight.winner_id === fight.fighter_b_id ? 'text-hxh-blue' : 'text-white/60'}`}>
                                                                    {fB?.name || 'Lutador Desconhecido'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 shrink-0">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[8px] text-gray-600 uppercase font-mono leading-none mb-1">Vencedor</span>
                                                                <span className="text-[10px] text-green-500 font-black uppercase italic tracking-tighter truncate max-w-[100px]">
                                                                    {winner?.name || 'Sincronização...'}
                                                                </span>
                                                            </div>
                                                            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-black md:grayscale md:group-hover:grayscale-0 transition-all border-green-500/30">
                                                                <img src={winner?.imageUrl} className="w-full h-full object-cover object-top pointer-events-none" referrerPolicy="no-referrer" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ));
                            })()}

                            {allFights.length === 0 && (
                                <div className="py-20 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-gray-700">
                                    <Activity size={32} className="mb-3 opacity-20 animate-pulse" />
                                    <p className="text-[10px] font-mono uppercase tracking-[0.3em]">Scanner da Torre buscando combates passados...</p>
                                </div>
                            )}
                        </div>
                    </div>
                    </>
                ) : (
                    <div className="animate-fade-in space-y-8">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6 justify-between">
                            <div className="flex items-center gap-4">
                                <ShieldCheck size={32} className="text-red-500" />
                                <div>
                                    <h3 className="font-display font-black uppercase text-lg italic tracking-tight">Centro de Aprovação Financeira</h3>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase">Verifique os comprovantes no Discord/Celular antes de aprovar.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-mono font-black text-white">{pendingTransactions.length}</p>
                                <p className="text-[9px] text-gray-500 uppercase">Pedidos Pendentes</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500">
                                        <th className="pb-4 pr-4">Data</th>
                                        <th className="pb-4 px-4">Hunter</th>
                                        <th className="pb-4 px-4">Operação</th>
                                        <th className="pb-4 px-4">Valor</th>
                                        <th className="pb-4 pl-4 text-right">Ação Corretiva</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {pendingTransactions.map(tx => (
                                        <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-6 pr-4 font-mono text-[10px] text-gray-500">
                                                {new Date(tx.created_at?.seconds * 1000).toLocaleString('pt-BR')}
                                            </td>
                                            <td className="py-6 px-4">
                                                <p className="text-xs font-bold uppercase">{tx.user_name}</p>
                                                <p className="text-[8px] text-gray-600 font-mono">{tx.user_id}</p>
                                            </td>
                                            <td className="py-6 px-4">
                                                <span className={`text-[9px] px-2 py-1 rounded font-black tracking-widest uppercase ${tx.type === 'DEPOSIT' ? 'bg-hxh-blue/20 text-hxh-blue' : 'bg-purple-500/20 text-purple-500'}`}>
                                                    {tx.type === 'DEPOSIT' ? 'Depósito' : 'Resgate'}
                                                </span>
                                                {tx.method && (
                                                    <div className="mt-1 space-y-1">
                                                        <span className="block text-[8px] text-gray-400 uppercase font-mono">Via {tx.method}</span>
                                                        {(tx.details || tx.method === 'PIX') && (
                                                            <div className="p-2 bg-black/40 border border-white/5 rounded font-mono text-[8px] text-hxh-blue break-all max-w-[120px]">
                                                                {typeof tx.details === 'string' ? tx.details : tx.details?.details || tx.details?.characterId || 'Sem detalhes'}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-6 px-4">
                                                <p className="text-sm font-black font-mono text-white">
                                                    {tx.type === 'DEPOSIT' ? `R$ ${tx.amountBRL?.toFixed(2)}` : `${tx.amountCoins?.toLocaleString()} TC`}
                                                </p>
                                                <p className="text-[9px] text-gray-500 font-mono">
                                                    {tx.type === 'DEPOSIT' ? `(+${tx.amountCoins?.toLocaleString()} TC)` : `(R$ ${(tx.amountCoins / 100 * 0.85).toFixed(2)} líq.)`}
                                                </p>
                                            </td>
                                            <td className="py-6 pl-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button 
                                                        onClick={() => handleProcessTransaction(tx.id, 'APPROVE')}
                                                        className="px-4 py-2 bg-green-500/10 text-green-500 border border-green-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/10"
                                                    >
                                                        Aprovar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleProcessTransaction(tx.id, 'REJECT')}
                                                        className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
                                                    >
                                                        Rejeitar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {pendingTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-32 text-center text-gray-600 font-mono text-[10px] uppercase tracking-[0.3em] italic opacity-50">
                                                Nenhum pedido de transação aguardando protocolo.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        )}
      </main>

      {/* NOTIFICATIONS OVERLAY */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
          <AnimatePresence>
              {appNotifications.map(note => (
                  <motion.div 
                    key={note.id}
                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className="pointer-events-auto w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden"
                  >
                      <div className={`absolute top-0 left-0 w-1 h-full ${note.type === 'SUCCESS' ? 'bg-[#00ff41]' : 'bg-red-500'}`} />
                      <div className="flex justify-between items-start gap-4">
                         <div className="space-y-1">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50">{note.title}</h4>
                             <p className="text-xs font-bold text-white leading-tight uppercase italic">{note.message}</p>
                         </div>
                         <button 
                            onClick={() => handleDismissNotification(note.id)}
                            className="p-1 hover:bg-white/5 rounded-full transition-colors"
                         >
                             <X size={14} className="text-gray-500" />
                         </button>
                      </div>
                  </motion.div>
              ))}
          </AnimatePresence>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {selectedFighter && (
            <TradeModal 
                fighter={selectedFighter} 
                userQuote={filteredQuotes.find(q => q.fighter_id === selectedFighter.id)}
                userBalance={userData?.coins_balance || 0}
                userData={userData}
                onClose={() => setSelectedFighter(null)}
                npcMatches={npcMatches}
                onRequireSecurity={() => {
                    setSelectedFighter(null);
                    setShowSecurity(true);
                }}
                userId={discordUser.id}
            />
        )}
        {showSecurity && (
            <V2SecurityModal 
                userId={discordUser.id} 
                onSuccess={() => setShowSecurity(false)} 
            />
        )}
        {showManager && (
            <V2CoinsManagerModal 
                userId={discordUser.id} 
                balance={userData?.coins_balance || 0}
                released={userData?.released_balance || 0}
                onClose={() => setShowManager(false)} 
                onSuccess={() => setShowManager(false)} 
            />
        )}
        {showRegister && (
            <V2RegisterFighterModal 
                userId={discordUser.id} 
                isAdmin={isJudge}
                onClose={() => setShowRegister(false)} 
                onSuccess={() => setShowRegister(false)} 
            />
        )}
        {showJudgeRegister && (
            <V2JudgeRegisterModal 
                userId={discordUser.id}
                isAdmin={isJudge}
                onClose={() => setShowJudgeRegister(false)}
                onSuccess={() => setShowJudgeRegister(false)}
            />
        )}
        {fighterToEdit && (
            <V2EditFighterModal 
                userId={discordUser.id}
                fighter={fighterToEdit}
                onClose={() => setFighterToEdit(null)}
                onSuccess={() => setFighterToEdit(null)}
            />
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

const V2SanctionMatchForm = ({ fighters, judgeName, onSuccess }: any) => {
    const [loading, setLoading] = useState(false);
    const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('hxh_sanction_webhook') || '');
    const [fighterAId, setFighterAId] = useState('');
    const [fighterBId, setFighterBId] = useState('');
    const [floor, setFloor] = useState(200);
    const [mentionRoles, setMentionRoles] = useState('<@&1100984179845505044>');

    const handleSanction = async () => {
        if (!webhookUrl || !fighterAId || !fighterBId) return alert('Preencha os campos obrigatórios.');
        
        setLoading(true);
        try {
            const fA = fighters.find((f: any) => f.id === fighterAId);
            const fB = fighters.find((f: any) => f.id === fighterBId);
            
            if (fA.id === fB.id) throw new Error("Selecione lutadores diferentes.");

            localStorage.setItem('hxh_sanction_webhook', webhookUrl);

            const res = await v2Service.sanctionMatch({
                webhookUrl,
                fighterA: fA,
                fighterB: fB,
                floor,
                mentionRoles,
                judgeName
            });

            if (res.error) throw new Error(res.error);
            alert('Luta Sancionada com Sucesso no Discord!');
            onSuccess();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto py-4">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-start gap-4 mb-2">
                <Terminal size={20} className="text-red-500 shrink-0 mt-1" />
                <p className="text-[10px] text-gray-400 font-mono uppercase leading-relaxed">
                    Interface oficial de sanção. Esta ação enviará um comunicado imediato para o Discord oficial através do Webhook configurado.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                    <div>
                        <label className="text-[9px] text-gray-500 uppercase font-black mb-2 block tracking-widest">Webhook Discord</label>
                        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-3 group focus-within:border-red-500 transition-all">
                            <Webhook size={14} className="text-gray-600 group-focus-within:text-red-500" />
                            <input 
                                type="text"
                                value={webhookUrl}
                                onChange={e => setWebhookUrl(e.target.value)}
                                placeholder="https://discord.com/api/webhooks/..."
                                className="bg-transparent w-full outline-none text-xs text-white font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[9px] text-gray-500 uppercase font-black mb-2 block tracking-widest">Andar da Disputa</label>
                        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-3 group focus-within:border-red-500 transition-all">
                            <Hash size={14} className="text-gray-600 group-focus-within:text-red-500" />
                            <input 
                                type="number"
                                value={isNaN(floor) ? '' : floor}
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    setFloor(val);
                                }}
                                className="bg-transparent w-full outline-none text-xs text-white font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[9px] text-gray-500 uppercase font-black mb-2 block tracking-widest">Menções Discord</label>
                        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-3 group focus-within:border-red-500 transition-all">
                            <Users size={14} className="text-gray-600 group-focus-within:text-red-500" />
                            <input 
                                type="text"
                                value={mentionRoles}
                                onChange={e => setMentionRoles(e.target.value)}
                                placeholder="@everyone ou <@&ID_CARGO>"
                                className="bg-transparent w-full outline-none text-xs text-white font-mono"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-black/60 border border-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-transparent opacity-30" />
               
                <div className="space-y-2">
                    <label className="text-[9px] text-red-500 uppercase font-black tracking-[0.2em] mb-2 block">Lutador A (Desafiante)</label>
                    <select 
                        className="w-full bg-black/80 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-red-500 transition-all font-display italic font-black uppercase"
                        value={fighterAId}
                        onChange={e => setFighterAId(e.target.value)}
                    >
                        <option value="">Selecionar Competidor</option>
                        {fighters.map((f: any) => (
                            <option key={f.id} value={f.id}>{f.name} (Ranking #{f.ranking})</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] text-red-500 uppercase font-black tracking-[0.2em] mb-2 block">Lutador B (Defensor)</label>
                    <select 
                        className="w-full bg-black/80 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-red-500 transition-all font-display italic font-black uppercase"
                        value={fighterBId}
                        onChange={e => setFighterBId(e.target.value)}
                    >
                        <option value="">Selecionar Competidor</option>
                        {fighters.map((f: any) => (
                            <option key={f.id} value={f.id}>{f.name} (Ranking #{f.ranking})</option>
                        ))}
                    </select>
                </div>
            </div>

            <button 
                onClick={handleSanction}
                disabled={loading || !webhookUrl || !fighterAId || !fighterBId}
                className="w-full py-5 bg-red-600 text-white font-black uppercase tracking-[0.3em] rounded-xl hover:bg-red-500 hover:shadow-[0_0_40px_rgba(220,38,38,0.4)] transition-all disabled:opacity-30 flex items-center justify-center gap-3 text-sm italic"
            >
                {loading ? (
                    <RefreshCw size={18} className="animate-spin" />
                ) : (
                    <>
                        <Gavel size={18} /> Oficializar Luta no Discord
                    </>
                )}
            </button>
        </div>
    );
};

const getFloorGroupRange = (floor: number) => {
    const f = floor || 1;
    const masters = [210, 220, 230, 240, 250, 251];
    if (masters.includes(f)) {
        return f === 251 ? "Mestre Absoluto" : `Mestre ${f}`;
    }
    if (f >= 241) return "241-250";
    if (f >= 231) return "231-240";
    if (f >= 221) return "221-230";
    if (f >= 211) return "211-220";
    if (f >= 200) return "200-210";
    
    // Grupos de 10
    const start = Math.floor(f / 10) * 10;
    const end = start + 9;
    const displayStart = start === 0 ? 1 : start;
    return `${String(displayStart).padStart(2, '0')}-${String(end).padStart(2, '0')}`;
};

const getNenTypeLabel = (type: string) => {
    switch (type) {
        case 'Enhancement': return 'Reforço';
        case 'Transmutation': return 'Transmutação';
        case 'Conjuration': return 'Materialização';
        case 'Emission': return 'Emissão';
        case 'Manipulation': return 'Manipulação';
        case 'Specialization': return 'Especialização';
        default: return type;
    }
};

const FighterCard = ({ fighter, onClick, userQuote, isOwner }: any) => {
    const masters = [210, 220, 230, 240, 250, 251];
    const isMaster = masters.includes(fighter.floor || 1);
    const isMasterCandidate = (fighter.floor || 1) >= 200 || isMaster;
    const floorRange = getFloorGroupRange(fighter.floor || 1);
    
    return (
        <motion.div 
            whileHover={{ scale: 1.01 }}
            onClick={onClick}
            className={`bg-[#0f0f0f] border rounded-[2rem] p-4 cursor-pointer transition-all flex flex-col gap-4 group relative overflow-hidden select-none ${
                isOwner ? 'border-hxh-blue/50 bg-hxh-blue/5 shadow-[0_0_30px_rgba(33,150,243,0.1)]' : 'border-white/5 md:hover:border-hxh-blue/30 active:border-hxh-blue/30 shadow-xl'
            }`}
        >
            {isOwner && (
                <div className="absolute top-0 left-0 bg-hxh-blue text-black font-black uppercase italic text-[7px] px-3 py-1.5 rounded-br-xl tracking-tighter shadow-md z-20">
                    IDENTIDADE CONFIRMADA
                </div>
            )}
            
            <div className="w-full aspect-[2/3] rounded-[1.5rem] bg-gray-900 overflow-hidden relative border border-white/10 shrink-0">
                <img 
                    src={fighter.imageUrl || `https://picsum.photos/seed/${fighter.id}/300/450`} 
                    alt={fighter.name}
                    className="w-full h-full object-cover object-top md:grayscale md:group-hover:grayscale-0 transition-all duration-700 pointer-events-none"
                    referrerPolicy="no-referrer"
                />
                
                {isMaster && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-black p-1.5 rounded-lg shadow-lg animate-pulse z-10">
                        <Crown size={14} />
                    </div>
                )}
            </div>
            
            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-display font-black uppercase italic tracking-tighter text-lg leading-tight group-hover:text-hxh-blue group-active:text-hxh-blue transition-colors px-1">{fighter.name}</h4>
                        <ChevronRight size={14} className="text-gray-700 group-hover:text-hxh-blue group-active:text-hxh-blue transition-transform group-hover:translate-x-1 group-active:translate-x-1 shrink-0" />
                    </div>
                    
                    <div className="flex items-center flex-wrap gap-2 mb-3 px-1">
                        <div className="bg-hxh-blue/10 px-2 py-0.5 rounded text-[8px] font-mono text-hxh-blue border border-hxh-blue/20 uppercase tracking-widest">
                            {floorRange}
                        </div>

                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase ${
                            (fighter.streak || 0) > 0 ? 'bg-green-500/10 text-green-500' : 
                            (fighter.streak || 0) < 0 ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-gray-500'
                        }`}>
                            {Math.abs(fighter.streak || 0)} {(fighter.streak || 0) >= 0 ? 'Vitórias' : 'Derrotas'} Seguidas
                        </span>
                        
                        {fighter.nenType && fighter.nenType !== 'None' && (
                            <span className="text-[8px] px-2 py-0.5 rounded font-black tracking-[0.2em] uppercase bg-white/10 text-white border border-white/10">
                                {getNenTypeLabel(fighter.nenType)}
                            </span>
                        )}
                    </div>

                    {userQuote && (
                        <div className="flex items-center gap-1.5 p-1 px-2 bg-[#00ff41]/10 border border-[#00ff41]/20 rounded-lg w-fit">
                            <Activity size={10} className="text-[#00ff41]" />
                            <p className="text-[9px] text-[#00ff41] uppercase tracking-widest font-mono font-black">
                                {userQuote.amount} Cotas
                            </p>
                        </div>
                    )}

                    {(fighter.jenny_blocked || 0) > 0 && (
                        <div className="flex items-center gap-1.5 p-1 px-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg w-fit mt-1">
                            <Zap size={10} className="text-yellow-500" />
                            <p className="text-[9px] text-yellow-500 uppercase tracking-widest font-mono font-black">
                                {fighter.jenny_blocked.toLocaleString()} TC (Bolsa)
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-end justify-between mt-auto">
                    <div>
                        <p className="text-[9px] text-gray-600 uppercase font-mono tracking-tighter mb-0.5">Valor Unit.</p>
                        <div className="flex items-center gap-1.5">
                            <Zap size={14} className="text-hxh-blue fill-hxh-blue/20" />
                            <span className="text-xl font-mono font-black text-hxh-blue leading-none">{fighter.quote_value}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-gray-600 uppercase font-mono tracking-tighter mb-0.5">Winrate</p>
                        <p className="text-sm font-mono font-black text-white/90">
                            {((fighter.wins / Math.max(1, fighter.total_fights)) * 100).toFixed(0)}%
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const TradeModal = ({ fighter, userQuote, userBalance, userData, onClose, onRequireSecurity, userId, npcMatches }: any) => {
    const [amount, setAmount] = useState(1);
    const [action, setAction] = useState<'BUY' | 'SELL'>('BUY');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    // Verificar se o usuário sancionou uma luta ativa deste lutador (NPC)
    const activeNPCMatchByMe = npcMatches?.find((m: any) => 
        m.status === 'SCHEDULED' && 
        m.created_by === userId && 
        (m.fighter_a_id === fighter.id || m.fighter_b_id === fighter.id)
    );

    useEffect(() => {
        v2Service.getMarketAnalysis(fighter.id).then(setAnalysis);
    }, [fighter.id]);

    const handleTrade = async () => {
        // Pedir telefone apenas na hora de operar
        if (!userData?.phone) {
            onRequireSecurity();
            return;
        }

        const maxBuy = Math.floor(userBalance / (fighter.quote_value * 1.1));
        const maxSell = userQuote?.amount || 0;

        if (action === 'BUY' && amount > maxBuy) return setError(`Limite máximo de compra: ${maxBuy} cotas`);
        if (action === 'SELL' && amount > maxSell) return setError(`Você possui apenas ${maxSell} cotas para venda`);

        // Validação de Auto-investimento no Frontend
        if (action === 'BUY' && fighter.user_id === userId) {
            return setError("Protocolo da Torre: Um lutador não pode adquirir suas próprias cotas. Foque em investir nos seus adversários!");
        }

        if (activeNPCMatchByMe) {
            return setError("CONFLITO DE INTERESSES: Você não pode negociar cotas de uma luta que você mesmo sancionou enquanto ela estiver ativa.");
        }

        setLoading(true);
        setError(null);
        try {
            const res = action === 'BUY' 
                ? await v2Service.buyQuote(userId, fighter.id, amount)
                : await v2Service.sellQuote(userId, fighter.id, amount);
            
            if (res.error) throw new Error(res.error);
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMax = () => {
        if (action === 'BUY') {
            const max = Math.floor(userBalance / (fighter.quote_value * 1.1));
            setAmount(Math.max(0, max));
        } else {
            setAmount(userQuote?.amount || 0);
        }
    };

    const totalCost = amount * fighter.quote_value;

    const ValorizationHelp = () => (
        <AnimatePresence>
            {showHelp && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-x-8 top-24 bottom-32 z-50 p-6 bg-[#0d1117] border border-hxh-blue/40 rounded-3xl text-[10px] font-mono leading-relaxed space-y-4 shadow-2xl flex flex-col"
                >
                    <div className="flex items-center gap-2 text-hxh-blue font-bold mb-1 shrink-0">
                        <HelpCircle size={14} /> 
                        <span className="uppercase tracking-widest text-[#2196f3]">Matriz de Valorização Celestial</span>
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <p className="text-gray-300">A Torre Celestial utiliza o sistema de <strong className="text-hxh-blue">Dualidade de Valor</strong> para garantir lucro real e sustentabilidade:</p>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex gap-2"><span className="text-hxh-blue font-black tracking-widest">LUCRO REAL:</span> A valorização vinda do volume de compra de outros **Hunters Reais** é convertida em **Saldo Liberado** (Sacável).</li>
                            <li className="flex gap-2"><span className="text-yellow-500 font-black tracking-widest">FATOR NPC:</span> A valorização vinda de vitórias contra NPCs e Ranking é convertida em **Saldo Bloqueado** (Poder de Jogo).</li>
                            <li className="flex gap-2"><span className="text-gray-400 font-black tracking-widest">RECUPERAÇÃO:</span> Ao vender, você sempre recupera seu investimento real (Principal) no Saldo Liberado.</li>
                        </ul>
                    </div>
                    <button 
                        onClick={() => setShowHelp(false)}
                        className="w-full py-4 bg-hxh-blue/10 text-hxh-blue border border-hxh-blue/30 font-bold uppercase tracking-widest text-[10px] rounded-xl hover:bg-hxh-blue/20 transition-all shrink-0 mt-4 shadow-[0_0_20px_rgba(33,150,243,0.1)]"
                    >
                        Entendido, Voltar
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-xl"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hxh-blue to-transparent opacity-50 shrink-0"></div>
                
                <ValorizationHelp />

                <div className="p-6 md:p-8 flex flex-col flex-1 overflow-hidden select-none">
                    <h2 className="text-xl md:text-2xl font-display font-black text-white italic uppercase tracking-tighter mb-6 flex items-center justify-between shrink-0">
                        <span>Negociar <span className="text-hxh-blue">Cotas</span></span>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
                    </h2>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl mb-4">
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                <img src={fighter.imageUrl || `https://picsum.photos/seed/${fighter.id}/150/150`} alt={fighter.name} className="w-full h-full object-cover object-top pointer-events-none" referrerPolicy="no-referrer" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-display font-bold text-base md:text-lg uppercase italic tracking-tight truncate">{fighter.name}</h3>
                                <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">Ranking: # {fighter.ranking}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-6">
                             <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                                <p className="text-[7px] text-gray-500 uppercase font-mono mb-1">Valor Total (Ranking)</p>
                                <div className="flex items-center gap-1">
                                    <Zap size={10} className="text-hxh-blue" />
                                    <span className="text-sm font-black font-mono text-white">{fighter.quote_value}</span>
                                </div>
                             </div>
                             <div className="p-3 bg-hxh-blue/5 border border-hxh-blue/20 rounded-xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-hxh-blue/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                <p className="text-[7px] text-hxh-blue uppercase font-bold font-mono mb-1 flex items-center gap-1">
                                    <Shield size={8} /> Liquidez Real (Sacável)
                                </p>
                                <div className="flex items-center gap-1 relative z-10">
                                    <span className="text-sm font-black font-mono text-white">
                                        {Math.round(fighter.market_value || 0)}
                                    </span>
                                    <span className="text-[8px] text-hxh-blue font-mono font-black italic">!</span>
                                </div>
                             </div>
                        </div>

                        <div className="flex gap-2 p-1 bg-black rounded-lg border border-white/5 mb-6">
                            <button 
                                onClick={() => setAction('BUY')}
                                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${action === 'BUY' ? 'bg-hxh-blue text-white shadow-[0_0_15px_rgba(33,150,243,0.3)]' : 'text-gray-600 hover:text-gray-400'}`}
                            >
                                Comprar
                            </button>
                            <button 
                                onClick={() => setAction('SELL')}
                                className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${action === 'SELL' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'text-gray-600 hover:text-gray-400'}`}
                            >
                                Vender
                            </button>
                        </div>

                        <div className="space-y-6">
                            {analysis?.auto_pump && action === 'BUY' && (
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                    <p className="text-[9px] text-yellow-500 font-mono uppercase leading-tight text-center tracking-tighter">
                                        ⚠️ <strong>Auto-Pump Detectado:</strong> O proprietário possui controle de mais de 50% do volume 24h. A valorização está congelada até a normalização.
                                    </p>
                                </div>
                            )}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Quantidade</label>
                                    <button 
                                        onClick={handleMax}
                                        className="text-[8px] font-black uppercase tracking-widest text-hxh-blue bg-hxh-blue/10 px-2 py-0.5 rounded border border-hxh-blue/20 hover:bg-hxh-blue/20 transition-all font-mono"
                                    >
                                        MÁX
                                    </button>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setAmount(Math.max(1, amount - 1))}
                                        className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 font-bold transition-colors"
                                    >-</button>
                                    <input 
                                        type="number" 
                                        value={isNaN(amount) ? '' : amount}
                                        onChange={(e) => {
                                            const rawVal = e.target.value === '' ? NaN : parseInt(e.target.value);
                                            if (isNaN(rawVal)) {
                                                setAmount(NaN);
                                                return;
                                            }
                                            const val = rawVal;
                                            const maxBuy = Math.floor(userBalance / (fighter.quote_value * 1.1));
                                            const maxSell = userQuote?.amount || 0;
                                            const limit = action === 'BUY' ? Math.max(1, maxBuy) : maxSell;
                                            setAmount(Math.min(limit, Math.max(0, val)));
                                        }}
                                        className="flex-1 bg-transparent border-b border-white/20 text-center font-mono text-xl focus:outline-none focus:border-hxh-blue py-1" 
                                    />
                                    <button 
                                        onClick={() => {
                                            const maxBuy = Math.floor(userBalance / (fighter.quote_value * 1.1));
                                            const maxSell = userQuote?.amount || 0;
                                            const limit = action === 'BUY' ? maxBuy : maxSell;
                                            if (amount < limit) setAmount(amount + 1);
                                        }}
                                        className="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center hover:bg-white/5 font-bold transition-colors"
                                    >+</button>
                                </div>
                            </div>

                            {action === 'BUY' && (
                                <>
                                    {fighter.quotes_available <= 10 && (
                                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                                            <p className="text-[9px] text-red-400 font-mono uppercase leading-normal text-center tracking-tighter">
                                                ⚠️ <strong className="text-red-500">Escassez de Cotas:</strong> Cada lutador tem um limite de 1000 cotas. 
                                                {fighter.quotes_available === 0 ? 
                                                    " No momento, todas as cotas estão em posse de investidores. Você só poderá comprar se alguém vender para o mercado." : 
                                                    ` Restam apenas ${fighter.quotes_available} cotas disponíveis para compra direta.`}
                                            </p>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => setShowHelp(true)}
                                        className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-hxh-blue/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-2">
                                            <HelpCircle size={14} className="text-hxh-blue" />
                                            <span className="text-[9px] text-gray-400 uppercase font-mono tracking-widest">Lógica de Valorização</span>
                                        </div>
                                        <ChevronRight size={12} className="text-gray-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                    </button>
                                </>
                            )}

                                    <div className="space-y-3 p-4 bg-white/5 rounded-2xl text-[10px] font-mono border border-white/5">
                                        <div className="flex justify-between text-gray-500">
                                            <span>Subtotal</span>
                                            <span className="text-white flex items-center gap-1 font-bold">
                                                {totalCost.toLocaleString()} <Zap size={10} className="text-hxh-blue" />
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span>Taxa {action === 'BUY' ? '(10%)' : '(5%)'}</span>
                                            <span className="text-red-400/80 flex items-center gap-1">
                                                {Math.round(totalCost * (action === 'BUY' ? 0.1 : 0.05)).toLocaleString()} <Zap size={10} />
                                            </span>
                                        </div>
                                        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                            <span className="text-gray-300 font-bold uppercase tracking-tight">Total Final</span>
                                            <span className={`text-sm font-black flex items-center gap-1 ${action === 'BUY' ? 'text-hxh-blue' : 'text-[#00ff41]'}`}>
                                                {Math.round(action === 'BUY' ? totalCost * 1.1 : totalCost * 0.95).toLocaleString()} <Zap size={12} fill="currentColor" />
                                            </span>
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                            className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[9px] font-mono uppercase tracking-tight flex items-start gap-2"
                                        >
                                            <span className="shrink-0 mt-0.5">⚠️</span>
                                            <span>{error}</span>
                                        </motion.div>
                                    )}
                                </div>
                    </div>

                    {!showHelp && (
                        <div className="pt-6 shrink-0">
                            <button 
                                disabled={loading || (action === 'SELL' && (!userQuote || userQuote.amount < amount)) || (action === 'BUY' && userBalance < totalCost * 1.1)}
                                onClick={handleTrade}
                                className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2 ${
                                    loading ? 'opacity-50 cursor-not-allowed' : ''
                                } ${
                                    action === 'BUY' ? 'bg-hxh-blue text-white hover:shadow-[0_0_30px_rgba(33,150,243,0.4)]' : 'bg-red-500 text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                                }`}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    `Executar ${action === 'BUY' ? 'Compra' : 'Venda'}`
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const V2SecurityModal = ({ userId, onSuccess }: any) => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!phone || phone.length < 10) return setError("Informe um número de celular válido (com DDD).");
        setLoading(true);
        setError(null);
        try {
            const res = await v2Service.updatePhone(userId, phone);
            if (res.error) throw new Error(res.error);
            onSuccess();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0a0a0a] border border-hxh-blue/30 rounded-3xl w-full max-w-sm p-8 text-center"
            >
                <div className="w-16 h-16 bg-hxh-blue/20 rounded-full flex items-center justify-center text-hxh-blue mx-auto mb-6">
                    <Shield size={32} />
                </div>
                <h2 className="text-xl font-display font-black uppercase italic tracking-tighter text-white mb-2">Segurança Hunter</h2>
                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest leading-relaxed mb-6">
                    Para habilitar investimentos e saques na Torre Celestial - Ascenção, vincule um número de celular único à sua conta.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
                    <label className="text-[8px] text-gray-500 uppercase font-black font-mono mb-2 block tracking-[0.2em]">WhatsApp / Celular (DDD + NÚMERO)</label>
                    <input 
                        type="text" 
                        placeholder="Ex: 11999998888"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-transparent border-b border-hxh-blue/30 py-2 text-hxh-blue font-mono focus:outline-none focus:border-hxh-blue tracking-widest"
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-[9px] font-mono uppercase mb-6">
                        {error}
                    </div>
                )}

                <button 
                    disabled={loading}
                    onClick={handleSave}
                    className="w-full py-4 bg-hxh-blue text-white font-black uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(33,150,243,0.3)] hover:scale-105 transition-all disabled:opacity-50"
                >
                    {loading ? 'Validando...' : 'Vincular e Sincronizar'}
                </button>
                <p className="text-[8px] text-gray-600 uppercase font-mono mt-4 leading-normal">
                    Seu número é utilizado apenas para prevenção de multi-contas e segurança de transações financeiras.
                </p>
            </motion.div>
        </div>
    );
};
