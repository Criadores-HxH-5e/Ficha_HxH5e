import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Skull, Plus, X, Save, Zap, BookOpen, Dices, Crown, RefreshCw, Trash2, ImagePlus, ChevronUp, ChevronDown, Gavel } from 'lucide-react';
import { Character, DiscordUser } from '../types';
import { ADMIN_CONFIG, DISCORD_CONFIG, INITIAL_CHARACTER, DISCORD_ROLES } from '../constants';
import { firebaseService } from '../services/firebaseService';
const auth = { currentUser: null };
// firebase/firestore stubs (V1 Classic descontinuado)
const collection = () => null, onSnapshot = () => () => {}, query = (...a: any[]) => null,
      orderBy = () => null, doc = () => null, updateDoc = async () => {}, setDoc = async () => {},
      serverTimestamp = () => new Date().toISOString(), deleteDoc = async () => {};

interface Props {
  discordUser: DiscordUser | null;
}

export const OtherCompetitors: React.FC<Props> = ({ discordUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [competitors, setCompetitors] = useState<Character[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [imageEditTarget, setImageEditTarget] = useState<Character | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(auth.currentUser?.email || null);
  
  // Real check for admin status: Discord Roles OR Admin Email
  const userRoles = discordUser?.roles || [];
  const isJudge = DISCORD_ROLES.JUDGE.some(id => userRoles.includes(id));
  const isSuperAdmin = currentUserEmail === 'lucas.avila.leandro@gmail.com';
  const isAdmin = isJudge || isSuperAdmin;
  
  // Listen for auth changes to update isAdmin status reactively
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUserEmail(user?.email || null);
    });
    return unsub;
  }, []);
  
  // Firebase Sync
  useEffect(() => {
    // Agora buscamos na nova coleção 'characters'
    const q = query(collection(db, 'characters'), orderBy('floor', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as any[];
      setCompetitors(list);
    }, (error) => {
      console.error("Error syncing characters:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (charId: string) => {
    if (!isAdmin) {
        alert("Ação negada: Você não tem privilégios de Juiz da Torre.");
        return;
    }
    setDeleteConfirmId(charId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    try {
        setActionError(null);
        await deleteDoc(doc(db, 'characters', deleteConfirmId));
        setDeleteConfirmId(null);
    } catch (e: any) {
        console.error("Erro ao deletar:", e);
        setActionError(e.message || 'Erro deconhecido ao remover personagem');
    }
  };

  const handleUpdateFloor = async (comp: Character, increment: number) => {
    if (!isAdmin) return;
    // Pula de 10 em 10 andares conforme o sistema da Torre
    const oldFloor = comp.floor || comp.fighterStats?.currentFloor || 1;
    const newFloor = Math.max(1, oldFloor + (increment * 10));
    
    try {
        const docRef = doc(db, 'characters', comp.id || '');
        await updateDoc(docRef, { 
            'floor': newFloor,
            'fighterStats.currentFloor': newFloor 
        });
    } catch (e) {
        console.error("Erro ao atualizar andar:", e);
    }
  };

  const handleUpdateImage = (comp: Character) => {
    if (!isAdmin) return;
    setImageEditTarget(comp);
    setNewImageUrl(comp.imageUrl || '');
  };

  const confirmImageUpdate = async () => {
    if (!imageEditTarget) return;
    
    try {
        const id = imageEditTarget.id || '';
        const docRef = doc(db, 'characters', id);
        await updateDoc(docRef, { imageUrl: newImageUrl });
        setImageEditTarget(null);
    } catch (e) {
        console.error("Erro ao atualizar imagem:", e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // ~800KB limit for Firestore docs
        alert("Imagem muito pesada! O limite do Terminal é 800KB para evitar sobrecarga no banco de dados.");
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        setNewImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePromote = async (comp: Character) => {
    if (!isAdmin) return;
    const newStatus = !comp.isFloorMaster;
    
    try {
        const docRef = doc(db, 'characters', comp.id || comp.discordId || '');
        await updateDoc(docRef, { isFloorMaster: newStatus });
        
        if (newStatus && DISCORD_CONFIG.OUTBOUND_WEBHOOK_URL) {
            await fetch(DISCORD_CONFIG.OUTBOUND_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `👑 **NOVO MESTRE DE ANDAR!**`,
                    embeds: [{
                        title: "PROMOÇÃO DE ELITE",
                        description: `O lutador **${comp.name}** foi oficialmente reconhecido como um **Floor Master**!`,
                        color: 16766720, // Gold
                        thumbnail: { url: 'https://cdn-icons-png.flaticon.com/512/6941/6941697.png' },
                        fields: [
                            { name: "Andar", value: `${comp.fighterStats.currentFloor}`, inline: true },
                            { name: "Nível", value: `${comp.level}`, inline: true }
                        ],
                        footer: { text: "Associação Hunter - Torre Celestial" },
                        timestamp: new Date().toISOString()
                    }]
                })
            });
        }
    } catch (e) {
        console.error("Erro ao promover:", e);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    img: '',
    level: 1,
    floor: 1,
    nenType: 'Enhancement',
    isNenUser: false,
    source: '5e RPG' as 'Canonical' | '5e RPG'
  });

  const handleSave = async () => {
    if (!formData.name) {
        alert("Nome é obrigatório!");
        return;
    }

    try {
        if (!auth.currentUser) {
            console.error("Usuário não autenticado no Firebase!");
            alert("Erro: Você precisa estar logado para salvar competidores.");
            return;
        }

        const characterId = `char_manual_${Date.now()}`;
        const newCharacter: Character = {
            ...INITIAL_CHARACTER,
            id: characterId,
            ownerId: auth.currentUser.uid,
            discordId: discordUser?.id, // Associa ao Discord do criador se for manual
            name: formData.name,
            level: formData.level,
            floor: formData.floor,
            nenType: formData.nenType as any,
            imageUrl: formData.img,
            totalEarnings: 0,
            jenny: 0,
            fighterStats: {
                ...INITIAL_CHARACTER.fighterStats,
                currentFloor: formData.floor
            }
        };

        console.log("Tentando salvar personagem no Firestore:", newCharacter);
        await firebaseService.saveCharacter(newCharacter);
        
        alert(`Personagem ${formData.name} registrado com sucesso!`);
        setShowModal(false);
        setFormData({
            name: '',
            img: '',
            level: 1,
            floor: 1,
            nenType: 'Enhancement',
            isNenUser: false,
            source: '5e RPG'
        });
    } catch (e: any) {
        console.error("Erro detalhado ao salvar competidor:", e);
        // Se for erro de permissão, e.code será 'permission-denied'
        const errorMsg = e.code === 'permission-denied' 
            ? "Permissão negada no banco de dados. Verifique se você é um administrador."
            : (e.message || 'Erro desconhecido');
        alert(`Erro ao salvar competidor: ${errorMsg}`);
    }
  };

  const syncFromOtherApp = async () => {
    if (!formData.name) {
        alert("Digite o nome para buscar no outro app!");
        return;
    }
    
    setIsSyncing(true);
    try {
        // Credenciais do Supabase do App Recomeço
        const SUPABASE_URL = 'https://qbppvrsevwucrbrtdonx.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFicHB2cnNldnd1Y3JicnRkb254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA3OTgsImV4cCI6MjA5MTI5Njc5OH0.HCLqFi7jTrRpNZymWjGs-O2L3uPjWHGzD2Z2k2Dce-M';

        // Buscamos na tabela 'characters' onde o nome dentro do JSON 'data' seja igual ao digitado
        // Nota: Usamos o operador ->> do PostgREST para acessar campos JSON
        const response = await fetch(`${SUPABASE_URL}/rest/v1/characters?select=data`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error("Falha na conexão com o Supabase");

        const allCharacters = await response.json();
        
        // Procuramos o personagem pelo nome (ignorando maiúsculas/minúsculas)
        const found = allCharacters.find((row: any) => 
            row.data?.name?.toLowerCase() === formData.name.toLowerCase()
        );

        if (found && found.data) {
            const charData = found.data;
            
            // Mapeamento de Tipos de Nen (do RPG para o App da Torre)
            const nenMapping: Record<string, string> = {
                'REFORÇO': 'Enhancement',
                'TRANSFORMAÇÃO': 'Transmutation',
                'TRANSMUTAÇÃO': 'Transmutation',
                'EMISSÃO': 'Emission',
                'MATERIALIZAÇÃO': 'Conjuration',
                'MANIPULAÇÃO': 'Manipulation',
                'ESPECIALIZAÇÃO': 'Specialization'
            };

            setFormData(prev => ({
                ...prev,
                level: charData.level || charData.lvl || 1,
                nenType: nenMapping[charData.class?.toUpperCase()] || 'Enhancement',
                isNenUser: !!charData.class
            }));

            alert(`✅ Dados de "${charData.name}" sincronizados com sucesso!\nNível: ${charData.level}\nTipo: ${charData.class}`);
        } else {
            alert("❌ Personagem não encontrado no banco de dados do App Recomeço.");
        }
    } catch (e) {
        console.error("Erro na sincronização:", e);
        alert("Erro ao conectar com o banco de dados do outro app. Verifique sua conexão.");
    } finally {
        setIsSyncing(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in relative">
          <div className="col-span-full mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                      <Gavel className="text-red-500" size={32} />
                  </div>
                  <div>
                      <h2 className="text-3xl font-display font-bold text-white tracking-widest uppercase italic flex items-center gap-3">
                          Painel do Juiz de Andar
                      </h2>
                      <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
                          Gestão de Competidores e Sancionamento de Combates
                      </p>
                  </div>
              </div>
              {isAdmin && (
                  <button 
                    onClick={() => setShowModal(true)}
                    className="bg-hxh-green text-black font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-white transition-all transform hover:scale-105 uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(0,255,65,0.4)]"
                  >
                    <Plus size={20} /> Cadastrar Novo Lutador
                  </button>
              )}
          </div>

          {competitors.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-hxh-panel border border-dashed border-gray-800 rounded-lg">
                  <Users size={48} className="mx-auto text-gray-700 mb-4 opacity-20" />
                  <p className="text-gray-500 font-display uppercase tracking-widest text-sm">Nenhum competidor registrado no banco de dados</p>
                  <p className="text-gray-600 text-xs mt-2">Novos registros aparecem aqui após o login ou cadastro manual.</p>
              </div>
          ) : competitors.map((comp) => (
              <div key={comp.id} className={`bg-hxh-panel border rounded-lg overflow-hidden transition-all group relative flex flex-col ${comp.isFloorMaster ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-gray-800 hover:border-hxh-green'}`}>
                  <div className="h-40 overflow-hidden relative bg-black">
                      {comp.imageUrl ? (
                          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" style={{ backgroundImage: `url(${comp.imageUrl})` }} />
                      ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gray-900/50 p-4 text-center">
                              {isAdmin ? (
                                  <button 
                                    onClick={() => handleUpdateImage(comp)}
                                    className="flex flex-col items-center gap-2 hover:text-hxh-green transition-colors"
                                  >
                                      <ImagePlus size={32} strokeWidth={1} />
                                      <span className="text-[10px] font-display uppercase tracking-tighter">Clique aqui para selecionar a imagem do personagem</span>
                                  </button>
                              ) : (
                                  <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(https://picsum.photos/seed/${comp.name}/400/600)` }} />
                              )}
                          </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-hxh-panel via-transparent to-transparent" />
                      
                      {/* Admin Image Edit Button */}
                      {isAdmin && comp.imageUrl && (
                          <button 
                             onClick={(e) => { e.stopPropagation(); handleUpdateImage(comp); }}
                             className="absolute top-2 left-2 z-20 p-1.5 bg-black/60 backdrop-blur-md rounded text-gray-400 hover:text-white transition-colors"
                             title="Trocar Imagem"
                          >
                              <ImagePlus size={14} />
                          </button>
                      )}

                      {/* Delete Button */}
                      {isAdmin && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete((comp as any).id || comp.discordId || ''); }}
                            className="absolute top-2 right-2 z-20 p-1.5 bg-red-900/40 backdrop-blur-md rounded text-red-500 hover:bg-red-900/60 transition-all opacity-0 group-hover:opacity-100"
                            title="Remover Competidor"
                          >
                              <Trash2 size={14} />
                          </button>
                      )}

                      {/* Floor Badge */}
                      <div className="absolute bottom-2 left-4 z-10 flex items-center gap-1">
                          <span className="bg-hxh-green text-black font-bold text-xs px-2 py-0.5 rounded skew-x-[-10deg] inline-block shadow-lg">
                              ANDAR {comp.fighterStats.currentFloor}
                          </span>
                          {isAdmin && (
                              <div className="flex flex-col ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleUpdateFloor(comp, 1)} className="p-0.5 bg-gray-800 hover:bg-hxh-green hover:text-black rounded-t transition-colors"><ChevronUp size={10} /></button>
                                  <button onClick={() => handleUpdateFloor(comp, -1)} className="p-0.5 bg-gray-800 hover:bg-red-500 hover:text-white rounded-b transition-colors"><ChevronDown size={10} /></button>
                              </div>
                          )}
                      </div>

                      {/* Tags (Top Right) */}
                      <div className={`absolute top-2 right-2 flex flex-col gap-1 items-end z-10 ${isAdmin ? 'translate-x-[-30px]' : ''}`}>
                          {comp.isFloorMaster && (
                            <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded flex items-center gap-1 shadow-lg">
                                <Crown size={10} fill="currentColor" /> FLOOR MASTER
                            </span>
                          )}
                          <span className="bg-purple-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur-sm border border-purple-400/30">
                              <Zap size={10} /> {comp.nenType}
                          </span>
                      </div>
                  </div>

                  <div className="p-4 relative flex-1 flex flex-col">
                      <h3 className="text-xl font-display font-bold text-white mb-1 truncate">{comp.name}</h3>
                      <p className="text-gray-400 text-xs font-mono uppercase mb-4">Nível {comp.level}</p>

                      <div className="mt-auto grid grid-cols-2 gap-2 text-center text-xs mb-4">
                          <div className="bg-gray-900 rounded p-2 border border-gray-800">
                              <span className="block text-green-500 font-bold flex justify-center items-center gap-1">
                                  <TrendingUp size={10} /> {comp.fighterStats.totalWins} V
                              </span>
                          </div>
                          <div className="bg-gray-900 rounded p-2 border border-gray-800">
                              <span className="block text-red-500 font-bold flex justify-center items-center gap-1">
                                  <Skull size={10} /> {comp.fighterStats.totalLosses} D
                              </span>
                          </div>
                      </div>

                      {isAdmin && (
                          <button 
                            onClick={() => handlePromote(comp)}
                            className={`w-full py-2 rounded text-[10px] font-bold uppercase tracking-tighter transition-all flex items-center justify-center gap-2 ${comp.isFloorMaster ? 'bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-900/40' : 'bg-yellow-900/20 text-yellow-500 border border-yellow-900/50 hover:bg-yellow-900/40'}`}
                          >
                            {comp.isFloorMaster ? <><X size={12}/> Remover Título</> : <><Crown size={12}/> Promover a Floor Master</>}
                          </button>
                      )}
                  </div>
              </div>
          ))}
      </div>

      {/* Modal Imagem Edit */}
      {imageEditTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setImageEditTarget(null)} />
              <div className="relative bg-[#111] border border-hxh-blue/50 p-6 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in custom-scrollbar">
                  <h3 className="text-xl font-display font-bold text-white mb-4 uppercase tracking-tighter flex items-center gap-2 sticky top-0 bg-[#111] pb-2 z-10">
                      <ImagePlus size={20} className="text-hxh-blue" /> Atualizar Identidade Visual
                  </h3>
                  
                  <div className="mb-6 aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden border-2 border-dashed border-gray-800 flex items-center justify-center relative">
                      {newImageUrl ? (
                          <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                          <div className="text-gray-700 font-mono text-xs uppercase">Sem Preview</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Prévia do Banco de Dados</span>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1">URL da Imagem</label>
                          <input 
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-hxh-blue outline-none text-xs font-mono"
                            value={newImageUrl}
                            onChange={e => setNewImageUrl(e.target.value)}
                            placeholder="https://imgur.com/..."
                          />
                      </div>

                      <div className="relative">
                          <label className="block text-gray-400 text-[10px] uppercase font-bold mb-1">Ou Carregar Arquivo Local (Máx 800KB)</label>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-hxh-blue outline-none text-xs cursor-pointer file:bg-hxh-blue file:border-none file:text-black file:font-bold file:px-3 file:py-1 file:rounded file:mr-4 file:cursor-pointer hover:file:bg-white"
                          />
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      <button 
                        onClick={() => setImageEditTarget(null)}
                        className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded transition-colors uppercase text-xs"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={confirmImageUpdate}
                        className="flex-1 py-2 bg-hxh-blue hover:bg-blue-400 text-black font-bold rounded transition-colors uppercase text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                      >
                        Aplicar Identidade
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Modal Deletar Confirmação */}
      {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setDeleteConfirmId(null)} />
              <div className="relative bg-[#111] border border-red-900/50 p-6 rounded-xl max-w-sm w-full shadow-2xl animate-fade-in text-center max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <Skull className="text-red-500 mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-display font-bold text-white mb-2 uppercase tracking-tighter">Eliminar Competidor?</h3>
                  <p className="text-gray-400 text-sm mb-6">
                      Você está prestes a remover permanentemente este registro da Arena Celestial. Esta ação não pode ser desfeita por nenhum Juiz.
                  </p>
                  
                  {actionError && (
                      <div className="bg-red-900/20 border border-red-900/50 text-red-500 p-3 rounded mb-4 text-xs">
                          {actionError}
                      </div>
                  )}

                  <div className="flex gap-3">
                      <button 
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded transition-colors uppercase text-xs"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={confirmDelete}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-colors uppercase text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                      >
                        Eliminar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Modal Cadastro */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
           <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowModal(false)} />
           
           <div className="relative bg-[#111] border border-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
              <div className="bg-[#050505] p-4 flex justify-between items-center border-b border-gray-800 sticky top-0 z-10">
                  <h2 className="text-white font-display font-bold uppercase flex items-center gap-2">
                      <Plus size={18} className="text-hxh-green"/> Novo Competidor
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                  <div className="flex gap-2 items-end">
                      <div className="flex-1">
                          <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Nome do Personagem</label>
                          <input 
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-hxh-green outline-none"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="Ex: Gon Freecss"
                          />
                      </div>
                      <button 
                        onClick={syncFromOtherApp}
                        disabled={isSyncing}
                        className={`bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded transition-colors ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Sincronizar Nível do App Recomeço"
                      >
                        <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                      </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Nível</label>
                          <input 
                            type="number"
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-hxh-green outline-none"
                            value={formData.level}
                            onChange={e => setFormData({...formData, level: Number(e.target.value)})}
                          />
                      </div>
                      <div>
                          <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Andar Inicial</label>
                          <input 
                            type="number"
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-hxh-green outline-none"
                            value={formData.floor}
                            onChange={e => setFormData({...formData, floor: Number(e.target.value)})}
                          />
                      </div>
                  </div>

                  <div>
                      <label className="block text-gray-400 text-xs uppercase font-bold mb-1">Tipo de Nen</label>
                      <select 
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-hxh-green outline-none"
                        value={formData.nenType}
                        onChange={e => setFormData({...formData, nenType: e.target.value})}
                      >
                          <option value="Enhancement">Reforço</option>
                          <option value="Transmutation">Transformação</option>
                          <option value="Emission">Emissão</option>
                          <option value="Conjuration">Materialização</option>
                          <option value="Manipulation">Manipulação</option>
                          <option value="Specialization">Especialização</option>
                      </select>
                  </div>

                  <div>
                      <label className="block text-gray-400 text-xs uppercase font-bold mb-1">URL da Imagem (Opcional)</label>
                      <input 
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-hxh-green outline-none text-sm font-mono"
                        value={formData.img}
                        onChange={e => setFormData({...formData, img: e.target.value})}
                        placeholder="https://..."
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                           <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Usuário de Nen</label>
                           <div className="flex gap-2">
                               <button 
                                  onClick={() => setFormData({...formData, isNenUser: true})}
                                  className={`flex-1 py-2 text-xs font-bold rounded border ${formData.isNenUser ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                               >
                                  SIM
                               </button>
                               <button 
                                  onClick={() => setFormData({...formData, isNenUser: false})}
                                  className={`flex-1 py-2 text-xs font-bold rounded border ${!formData.isNenUser ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                               >
                                  NÃO
                               </button>
                           </div>
                      </div>

                      <div>
                           <label className="block text-gray-400 text-xs uppercase font-bold mb-2">Origem</label>
                           <div className="flex gap-2">
                               <button 
                                  onClick={() => setFormData({...formData, source: '5e RPG'})}
                                  className={`flex-1 py-2 text-xs font-bold rounded border ${formData.source === '5e RPG' ? 'bg-orange-600 border-orange-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                               >
                                  RPG
                               </button>
                               <button 
                                  onClick={() => setFormData({...formData, source: 'Canonical'})}
                                  className={`flex-1 py-2 text-xs font-bold rounded border ${formData.source === 'Canonical' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-500'}`}
                               >
                                  CANON
                               </button>
                           </div>
                      </div>
                  </div>

                  <button 
                    onClick={handleSave}
                    className="w-full bg-hxh-green text-black font-bold py-3 rounded mt-4 hover:bg-white transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                      <Save size={18} /> Salvar Registro
                  </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};
