import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/supabase';
import { 
    X, 
    CreditCard, 
    Zap, 
    CheckCircle, 
    Smartphone, 
    Landmark, 
    ShieldCheck, 
    ArrowRight,
    Users,
    Shield,
    Target,
    Activity,
    TrendingUp,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { v2Service } from '../../src/services/v2Service';

interface ModalProps {
    userId: string;
    onClose: () => void;
    onSuccess: (data?: any) => void;
}

export const V2DepositModal: React.FC<ModalProps> = ({ userId, onClose, onSuccess }) => {
    const [amountBRL, setAmountBRL] = useState<string>('');
    const [step, setStep] = useState<'INPUT' | 'PAYMENT' | 'PROCESSING' | 'SUCCESS'>('INPUT');
    const [loading, setLoading] = useState(false);

    const coinsAmount = Math.floor((parseFloat(amountBRL) || 0) * 100);

    const handleConfirmPayment = async () => {
        setLoading(true);
        setStep('PROCESSING');
        try {
            const res = await v2Service.deposit(userId, parseFloat(amountBRL));
            if (res.error) throw new Error(res.error);
            
            setTimeout(() => {
                setStep('SUCCESS');
                setTimeout(() => onSuccess(res), 3000);
            }, 1000);
        } catch (e: any) {
            alert(e.message);
            setStep('INPUT');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {step === 'INPUT' && (
                <div className="space-y-6">
                    <p className="text-gray-500 font-mono text-[10px] uppercase text-center tracking-widest">
                        Adquira TC Coin para operar no mercado de Fighters
                    </p>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-6 focus-within:border-hxh-blue transition-all">
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-2 block">Valor em Reais (R$)</label>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-gray-400">R$</span>
                            <input 
                                type="number" 
                                value={amountBRL}
                                onChange={(e) => setAmountBRL(e.target.value)}
                                placeholder="0,00"
                                className="bg-transparent text-white font-mono text-3xl w-full outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-hxh-blue/10 border border-hxh-blue/30 rounded-xl">
                        <span className="text-xs text-gray-400 uppercase">Você recebe</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-mono font-bold text-hxh-blue">{coinsAmount.toLocaleString()}</span>
                            <Zap size={18} className="text-hxh-blue fill-hxh-blue/20" />
                        </div>
                    </div>
                    <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                        <p className="text-[9px] text-yellow-500 font-black uppercase text-center flex items-center justify-center gap-2">
                            <Shield size={12} /> Protocolo de Aprovação: O crédito requer confirmação manual do Juiz.
                        </p>
                    </div>
                    <button 
                        onClick={() => setStep('PAYMENT')}
                        disabled={!amountBRL || parseFloat(amountBRL) < 0.5}
                        className="w-full py-4 bg-hxh-blue text-white font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(33,150,243,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Gerar Pagamento
                    </button>
                </div>
            )}

            {step === 'PAYMENT' && (
                <div className="space-y-6 text-center animate-fade-in">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-[9px] text-hxh-blue font-black uppercase tracking-widest mb-4">
                            Siga as instruções para garantir o envio
                        </p>
                        <div className="bg-white p-2 rounded-2xl mx-auto w-48 shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-4">
                            <img src="https://i.pinimg.com/1200x/87/c5/67/87c567faf4cde29658a1470df9508abc.jpg" alt="QR Code" className="w-full h-auto rounded-lg" />
                        </div>
                        <p className="text-[8px] text-gray-500 font-mono uppercase leading-relaxed text-center">
                            O pagamento será analisado pela auditoria financeira da associação hunter.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Chave Pix (E-mail)</p>
                        <div className="flex items-center justify-between">
                            <code className="text-xs font-mono text-hxh-blue break-all">hxh5ebrasil@gmail.com</code>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText("hxh5ebrasil@gmail.com");
                                    alert("Chave Copiada!");
                                }}
                                className="p-1 hover:text-white text-gray-500"
                            >
                                <Zap size={14} />
                            </button>
                        </div>
                    </div>
                    <button 
                        onClick={handleConfirmPayment}
                        className="w-full py-4 bg-hxh-blue text-white font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(33,150,243,0.3)] transition-all"
                    >
                        Estou no Discord e já paguei
                    </button>
                    <button onClick={() => setStep('INPUT')} className="text-xs text-gray-600 hover:text-white uppercase font-bold">Voltar</button>
                </div>
            )}

            {step === 'PROCESSING' && <Loader text="Sincronizando com a Torre Celestial..." />}
            {step === 'SUCCESS' && <SuccessMessage text="Solicitação de Depósito enviada! Aguardando aprovação do Juiz." />}
        </div>
    );
};

export const V2WithdrawModal: React.FC<ModalProps & { balance: number, released: number }> = ({ userId, balance, released, onClose, onSuccess }) => {
    const [amountCoins, setAmountCoins] = useState<string>('');
    const [step, setStep] = useState<'INPUT' | 'DETAILS' | 'PROCESSING' | 'SUCCESS'>('INPUT');
    const [method, setMethod] = useState<'PIX' | 'BANK' | 'CHARACTER'>('PIX');
    const [details, setDetails] = useState('');
    const [characters, setCharacters] = useState<any[]>([]);
    const [selectedCharId, setSelectedCharId] = useState<string>('');
    const [fetchingChars, setFetchingChars] = useState(false);

    const locked = Math.max(0, balance - released);

    const coinsToBRL = (coins: number) => {
        return (coins / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const val = parseInt(amountCoins) || 0;
    const fee = val * 0.15;
    const net = val - fee;

    const handleConfirm = async () => {
        setStep('PROCESSING');
        try {
            const withdrawDetails = method === 'CHARACTER' ? { characterId: selectedCharId } : { details };
            const res = await v2Service.withdraw(userId, val, method, withdrawDetails);
            if (res.error) throw new Error(res.error);
            setTimeout(() => {
                setStep('SUCCESS');
                setTimeout(() => onSuccess(res), 3000);
            }, 1000);
        } catch (e: any) {
            alert(e.message);
            setStep('INPUT');
        }
    };

    const fetchChars = async () => {
        setFetchingChars(true);
        try {
            const chars = await v2Service.getUserCharacters(userId);
            setCharacters(chars);
            if (chars.length > 0) setSelectedCharId(chars[0].id);
        } catch (e) {
            console.error("Erro ao buscar personagens:", e);
        } finally {
            setFetchingChars(false);
        }
    };

    const handleContinue = () => {
        if (method === 'CHARACTER') {
            fetchChars();
        }
        setStep('DETAILS');
    };

    return (
        <div className="space-y-6">
            {step === 'INPUT' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase text-gray-500">
                        <div className="space-y-1">
                            <span className="block">Saldo Liberado (Depósitos)</span>
                            <span className="text-hxh-blue font-bold">{released.toLocaleString()} TC Coin</span>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                            <span className="text-gray-600">Saldo Bloqueado (Bônus)</span>
                            <span className="text-yellow-500/60 font-bold">{locked.toLocaleString()} TC Coin</span>
                        </div>
                    </div>

                    <div className="p-3 bg-hxh-blue/5 border border-hxh-blue/20 rounded-xl space-y-2">
                        <p className="text-[9px] text-hxh-blue font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                           <Shield size={12} /> Sustentabilidade Econômica (V2)
                        </p>
                        <p className="text-[8px] text-gray-400 font-mono italic leading-tight uppercase">
                           Apenas o <strong className="text-white">Saldo Liberado</strong> (proveniente de depósitos reais e retorno de principal) pode ser resgatado como dinheiro real.
                           <br/><br/>
                           <span className="text-hxh-blue">NPCs & PROGRESSÃO:</span> Vitórias contra NPCs geram valorização <span className="text-white">percebida</span>. Ao vender cotas valorizadas por NPCs, o lucro é creditado exclusivamente como <span className="text-yellow-500">Saldo Bloqueado</span>, garantindo que nenhum saque ocorra sem entrada real de dinheiro no ecossistema.
                        </p>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-xl p-5">
                        <label className="text-[10px] text-gray-500 uppercase font-bold mb-3 block">Quantidade de TC Coin</label>
                        <input 
                            type="number" 
                            value={amountCoins}
                            onChange={(e) => setAmountCoins(e.target.value)}
                            className="bg-transparent text-white font-mono text-3xl w-full outline-none"
                            placeholder="0"
                        />
                        {val > 0 && (
                            <p className="text-hxh-blue font-mono text-xs mt-2 uppercase tracking-tight">Equivale a {coinsToBRL(val)}</p>
                        )}
                    </div>
                    <div className="space-y-3 text-[10px] font-mono uppercase bg-white/5 p-5 rounded-xl border border-white/10">
                        <div className="flex justify-between text-gray-400">
                            <span>Valor Bruto (Resgate)</span>
                            <span>{coinsToBRL(val)}</span>
                        </div>
                        <div className="flex justify-between text-red-500/80">
                            <span>Taxa da Torre Celestial (15%)</span>
                            <span>- {coinsToBRL(fee)}</span>
                        </div>
                        <div className="pt-3 border-t border-white/20 flex flex-col gap-1">
                            <div className="flex justify-between font-black text-xs text-[#00ff41]">
                                <span>Você Recebe (Líquido)</span>
                                <span>{coinsToBRL(net)}</span>
                            </div>
                            <p className="text-right text-[8px] text-gray-600 lowercase font-mono">Conversão: {net.toLocaleString('pt-BR')} {method === 'CHARACTER' ? 'Jenny' : 'coins'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button 
                            onClick={() => setMethod('PIX')}
                            className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${method === 'PIX' ? 'border-hxh-blue bg-hxh-blue/10 text-white shadow-[0_0_15px_rgba(33,150,243,0.1)]' : 'border-white/5 text-gray-500 hover:border-white/20'}`}
                        >
                            <Smartphone size={16} />
                            <span className="text-[8px] font-bold uppercase">PIX</span>
                        </button>
                        <button 
                            onClick={() => setMethod('BANK')}
                            className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${method === 'BANK' ? 'border-hxh-blue bg-hxh-blue/10 text-white shadow-[0_0_15px_rgba(33,150,243,0.1)]' : 'border-white/5 text-gray-500 hover:border-white/20'}`}
                        >
                            <Landmark size={16} />
                            <span className="text-[8px] font-bold uppercase">BANK</span>
                        </button>
                        <button 
                            onClick={() => setMethod('CHARACTER')}
                            className={`py-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${method === 'CHARACTER' ? 'border-hxh-blue bg-hxh-blue/10 text-white shadow-[0_0_15px_rgba(33,150,243,0.1)]' : 'border-white/5 text-gray-500 hover:border-white/20'}`}
                        >
                            <Users size={16} />
                            <span className="text-[8px] font-bold uppercase leading-none text-center">Transferir<br/>Personagem</span>
                        </button>
                    </div>
                    <button 
                        onClick={handleContinue}
                        disabled={val < 100 || val > (method === 'CHARACTER' ? balance : released)}
                        className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50"
                    >
                        {val > released && method !== 'CHARACTER' ? 'Saldo Liberado Insuficiente' : 'Continuar'}
                    </button>
                </div>
            )}

            {step === 'DETAILS' && (
                <div className="space-y-6 animate-fade-in">
                    {method === 'CHARACTER' ? (
                        <div className="space-y-4">
                            <label className="text-[10px] text-gray-500 uppercase font-bold mb-3 block">
                                Selecione o Personagem de Destino
                            </label>
                            {fetchingChars ? (
                                <div className="py-8 flex justify-center"><div className="w-6 h-6 border-2 border-hxh-blue border-t-transparent rounded-full animate-spin"></div></div>
                            ) : characters.length > 0 ? (
                                <div className="space-y-2">
                                    {characters.map(char => (
                                        <button 
                                            key={char.id}
                                            onClick={() => setSelectedCharId(char.id)}
                                            className={`w-full p-4 rounded-xl border transition-all text-left flex items-center justify-between ${selectedCharId === char.id ? 'border-hxh-blue bg-hxh-blue/10' : 'border-white/5 bg-black/40 hover:border-white/20'}`}
                                        >
                                            <div>
                                                <p className="font-bold uppercase text-xs">{char.name}</p>
                                                <p className="text-[9px] text-gray-500 font-mono">Saldo Atual: {char.jenny?.toLocaleString() || 0} Jenny</p>
                                            </div>
                                            {selectedCharId === char.id && <CheckCircle size={16} className="text-hxh-blue" />}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 border border-yellow-500/20 bg-yellow-500/5 rounded-xl text-center">
                                    <p className="text-yellow-500 text-[10px] uppercase font-bold">Nenhum personagem encontrado no sistema legado.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold mb-3 block">
                                {method === 'PIX' ? 'Sua Chave PIX' : 'Dados Bancários'}
                            </label>
                            <textarea 
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder={method === 'PIX' ? 'Ex: cpf, e-mail ou telefone' : 'Banco, Agência, Conta, Nome Completo'}
                                className="bg-black/40 border border-white/10 rounded-xl p-4 w-full h-32 focus:border-hxh-blue outline-none text-white font-mono text-sm resize-none"
                            />
                        </div>
                    )}
                    
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                        <p className="text-[9px] text-red-500 font-black uppercase text-center flex items-center justify-center gap-2 italic">
                            <Shield size={12} /> Auditoria Hunter: Saques podem levar até 24h para serem validados.
                        </p>
                    </div>

                    <button 
                        onClick={handleConfirm}
                        disabled={method === 'CHARACTER' && (!selectedCharId || characters.length === 0)}
                        className="w-full py-4 bg-hxh-blue text-white font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_0_30px_rgba(33,150,243,0.3)] disabled:opacity-50"
                    >
                        {method === 'CHARACTER' ? 'Confirmar Transferência' : 'Solicitar Resgate'}
                    </button>
                    <button onClick={() => setStep('INPUT')} className="w-full text-xs text-gray-600 hover:text-white uppercase font-bold">Voltar</button>
                </div>
            )}

            {step === 'PROCESSING' && <Loader text="Validando Protocolo de Saque..." />}
            {step === 'SUCCESS' && <SuccessMessage text="Solicitação de Saque enviada! Aguardando aprovação do Juiz." />}
        </div>
    );
};

export const V2CoinsManagerModal: React.FC<ModalProps & { balance: number, released: number }> = ({ userId, balance, released, onClose, onSuccess }) => {
    const [mode, setMode] = useState<'SELECT' | 'DEPOSIT' | 'WITHDRAW'>('SELECT');
    const locked = Math.max(0, balance - released);

    return (
        <BaseModal 
            title={mode === 'DEPOSIT' ? 'Investir (Depósito)' : mode === 'WITHDRAW' ? 'Resgatar (Saque)' : 'Gerenciar TC Coin'} 
            onClose={onClose}
            disableOverlayClick={mode !== 'SELECT'}
        >
            {mode === 'SELECT' && (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex gap-4 p-1 bg-black rounded-2xl border border-white/5 mb-2">
                        <button 
                            className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl bg-white/5 text-white"
                        >
                            Visão Geral da Carteira
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-2">
                         <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                            <span className="text-[8px] text-gray-500 uppercase font-mono block mb-1">Disponível Real</span>
                            <span className="text-hxh-blue font-black text-sm">{released.toLocaleString()}</span>
                         </div>
                         <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center relative overflow-hidden">
                            <span className="text-[8px] text-gray-500 uppercase font-mono block mb-1">Bônus / Lucro Bloq.</span>
                            <div className="flex flex-col items-center">
                                <span className="text-yellow-500/60 font-black text-sm">{locked.toLocaleString()}</span>
                                <span className="text-[7px] text-gray-600 font-mono uppercase tracking-tighter">Cap: 5.000</span>
                            </div>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <button 
                            onClick={() => setMode('DEPOSIT')}
                            className="p-6 bg-hxh-blue/10 border border-hxh-blue/20 rounded-2xl hover:bg-hxh-blue/20 hover:border-hxh-blue transition-all group flex items-center gap-4 text-left"
                        >
                            <div className="w-12 h-12 bg-hxh-blue/20 rounded-xl flex items-center justify-center text-hxh-blue group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="font-display font-black uppercase italic tracking-tighter text-base">Adicionar TC Coin</h3>
                                <p className="text-[9px] text-gray-500 uppercase font-mono">Via PIX (hxh5ebrasil@gmail.com)</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => setMode('WITHDRAW')}
                            className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white transition-all group flex items-center gap-4 text-left"
                        >
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="font-display font-black uppercase italic tracking-tighter text-base text-white">Sacar Ganhos</h3>
                                <p className="text-[9px] text-gray-500 uppercase font-mono">Liberado p/ Pix: {released.toLocaleString()} TC Coin</p>
                            </div>
                        </button>
                    </div>

                    <div className="p-4 bg-hxh-blue/5 border border-hxh-blue/10 rounded-xl">
                         <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                             <span className="text-gray-500">Saldo Total em Conta (TC Coin)</span>
                             <span className="text-hxh-blue font-bold">{balance.toLocaleString()} TC Coin</span>
                         </div>
                    </div>
                </div>
            )}

            {mode === 'DEPOSIT' && <V2DepositModal userId={userId} onClose={onClose} onSuccess={onSuccess} />}
            {mode === 'WITHDRAW' && <V2WithdrawModal userId={userId} balance={balance} released={released} onClose={onClose} onSuccess={onSuccess} />}
        </BaseModal>
    );
};

export const V2JudgeRegisterModal: React.FC<ModalProps & { isAdmin: boolean }> = ({ userId, onClose, onSuccess, isAdmin }) => {
    return <V2RegisterFighterModal userId={userId} onClose={onClose} onSuccess={onSuccess} isAdmin={isAdmin} />;
};

export const V2ResetArenaModal: React.FC<ModalProps & { isAdmin: boolean }> = ({ isAdmin, userId, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!confirm("⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL. Todos os lutadores, cotas e históricos da Torre Celestial - Ascenção serão APAGADOS. Deseja prosseguir com a reinicialização?")) return;
        
        setLoading(true);
        try {
            const res = await fetch('/api/v2/admin/clear-v2-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAdmin, userId })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            alert(data.message);
            onSuccess(null);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal title="Reinicializar Torre Celestial - Ascenção" onClose={onClose}>
            <div className="space-y-6">
                <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl text-center space-y-4">
                    <Trash2 size={48} className="text-red-500 mx-auto" />
                    <p className="text-[10px] font-mono text-gray-400 leading-relaxed uppercase tracking-widest">
                        Você está prestes a limpar toda a base de dados da Torre Celestial - Ascenção. Apenas Juízes Supremos possuem este poder.
                    </p>
                </div>
                <button 
                    disabled={loading}
                    onClick={handleReset}
                    className="w-full py-4 bg-red-500 text-white font-black uppercase tracking-widest text-[11px] rounded-xl hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] disabled:opacity-50 transition-all"
                >
                    {loading ? 'Reinicializando...' : 'Confirmar Limpeza Total'}
                </button>
            </div>
        </BaseModal>
    );
};

const NPC_ADMIN_ID = '513323323355037717';

interface CharPickerProps {
    label: string;
    chars: { id: string; name: string; nenType: string; floor: number; level: number; imageUrl?: string | null }[];
    loading: boolean;
    selectedId: string | null;
    onPick: (c: any) => void;
    emptyText: string;
}

const CharPickerSection: React.FC<CharPickerProps> = ({ label, chars, loading, selectedId, onPick, emptyText }) => (
    <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
        <label className="text-[9px] text-gray-500 uppercase font-black block tracking-widest">{label}</label>
        {loading && <p className="text-xs text-gray-500 text-center py-3">Buscando...</p>}
        {!loading && chars.length === 0 && <p className="text-xs text-gray-500 text-center py-2">{emptyText}</p>}
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {chars.map(c => (
                <button key={c.id} onClick={() => onPick(c)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left
                        ${selectedId === c.id
                            ? 'border-hxh-blue bg-hxh-blue/20 text-white'
                            : 'border-white/10 bg-black/40 hover:border-white/30 text-gray-400'}`}>
                    <div className="w-9 h-9 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-hxh-green border border-gray-700">
                        {c.imageUrl
                            ? <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            : c.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-[11px] font-bold truncate text-white">{c.name}</p>
                        <p className="text-[9px] text-gray-500 truncate">Andar {c.floor} · Nv {c.level}</p>
                    </div>
                </button>
            ))}
        </div>
    </div>
);

interface DbCharRow { id: string; data: any; user_id?: string; }

function charFromRow(row: DbCharRow) {
    const d = row.data || {};
    return {
        id:       row.id,
        name:     d.name || '?',
        nenType:  d.nenType || d.class || 'Enhancement',
        floor:    d.floor ?? 1,
        level:    d.level ?? 1,
        imageUrl: d.imageUrl || d.image_url || null,
    };
}

export const V2RegisterFighterModal: React.FC<ModalProps & { isAdmin?: boolean }> = ({ userId, onClose, onSuccess, isAdmin }) => {
    const [mode, setMode] = useState<'SELF' | 'OTHER' | 'NPC'>('SELF');
    const [formData, setFormData] = useState({ name: '', nenType: 'Enhancement', imageUrl: '', floor: 1, level: 1 });
    const [step, setStep] = useState<'CONTRACT' | 'INPUT' | 'PROCESSING' | 'SUCCESS'>('CONTRACT');

    // characters lists
    const [myChars,    setMyChars]    = useState<ReturnType<typeof charFromRow>[]>([]);
    const [npcChars,   setNpcChars]   = useState<ReturnType<typeof charFromRow>[]>([]);
    const [allUsers,   setAllUsers]   = useState<any[]>([]);
    const [otherChars, setOtherChars] = useState<ReturnType<typeof charFromRow>[]>([]);
    const [pickedUser, setPickedUser] = useState<any | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [userSearch, setUserSearch] = useState('');
    const [loadingChars, setLoadingChars] = useState(false);

    // fetch chars by raw user_id
    const fetchCharsFor = async (rawId: string) => {
        const { data } = await supabase.from('characters').select('id, data').eq('user_id', rawId).order('last_mod', { ascending: false });
        return (data as DbCharRow[] || []).map(charFromRow);
    };

    useEffect(() => {
        if (step !== 'INPUT') return;
        (async () => {
            setLoadingChars(true);
            if (mode === 'SELF') {
                setMyChars(await fetchCharsFor(userId));
            } else if (mode === 'NPC') {
                setNpcChars(await fetchCharsFor(NPC_ADMIN_ID));
            } else if (mode === 'OTHER' && allUsers.length === 0) {
                const { data } = await supabase.from('tc_users').select('id, discord_id, username, name').order('username');
                setAllUsers(data || []);
            }
            setLoadingChars(false);
        })();
    }, [mode, step]);

    const selectUser = async (u: any) => {
        setPickedUser(u);
        setLoadingChars(true);
        const rawId = u.discord_id || u.id.replace('discord:', '');
        setOtherChars(await fetchCharsFor(rawId));
        setLoadingChars(false);
    };

    const pickChar = (c: ReturnType<typeof charFromRow>) => {
        setSelectedId(c.id);
        setFormData({ name: c.name, nenType: c.nenType, imageUrl: c.imageUrl || '', floor: c.floor, level: c.level });
    };

    const targetId = mode === 'OTHER' ? (pickedUser?.discord_id || pickedUser?.id?.replace('discord:', '') || '') : '';

    const handleRegister = async () => {
        if (!formData.name) return;
        if (mode === 'OTHER' && !targetId) return alert('Selecione um Hunter alvo primeiro.');
        setStep('PROCESSING');
        try {
            const res = await v2Service.registerFighter({
                requesterId: userId,
                targetId,
                registrationMode: mode,
                name: formData.name,
                isAdmin,
                stats: { nenType: formData.nenType, imageUrl: formData.imageUrl, floor: formData.floor, level: formData.level },
            });
            if (res.error) throw new Error(res.error);
            setTimeout(() => { setStep('SUCCESS'); setTimeout(() => onSuccess(res), 1500); }, 800);
        } catch (e: any) {
            alert(e.message);
            setStep('INPUT');
        }
    };

    return (
        <BaseModal title={step === 'CONTRACT' ? 'Contrato de Admissão' : 'Registro de Lutador'} onClose={onClose}>
            {step === 'CONTRACT' && (
                <div className="space-y-6">
                    <div className="p-6 bg-hxh-blue/5 border border-hxh-blue/20 rounded-[2rem] space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield size={80} className="text-hxh-blue" />
                        </div>
                        
                        <div className="text-center space-y-2">
                           <h3 className="text-lg font-display font-black text-hxh-blue italic uppercase tracking-tighter">Termos da Torre Celestial</h3>
                           <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Protocolo de Capitalização V2</p>
                        </div>

                        <div className="space-y-4 text-[10px] font-mono leading-relaxed text-gray-400">
                           <p>Ao ingressar na Arena, você autoriza a emissão de <span className="text-white font-bold">1000 cotas</span> vinculadas ao seu nome. O valor inicial será calculado pelo algoritmo da Torre Celestial:</p>
                           
                           <div className="p-4 bg-black/60 rounded-2xl border border-white/5 space-y-3">
                              <p className="text-hxh-blue font-bold uppercase tracking-widest text-[8px] flex items-center gap-2">
                                 <TrendingUp size={12} /> Matriz de Cálculo TC Coin:
                              </p>
                              <ul className="space-y-2">
                                 <li className="flex justify-between border-b border-white/5 pb-1">
                                    <span className="text-gray-500">Valor Base:</span>
                                    <span className="text-white">50 TC Coin</span>
                                 </li>
                                 <li className="flex justify-between border-b border-white/5 pb-1">
                                    <span className="text-gray-500">Andar & Nível:</span>
                                    <span className="text-[#00ff41]">+3 TC Coin / +1.5 TC Coin</span>
                                 </li>
                                 <li className="flex justify-between border-b border-white/5 pb-1">
                                    <span className="text-gray-500">Ranking Ref (251):</span>
                                    <span className="text-hxh-blue">+0.8 TC Coin / Rank</span>
                                 </li>
                                 <li className="flex justify-between">
                                    <span className="text-gray-500">Bônus Streak:</span>
                                    <span className="text-yellow-400">+5 TC Coin / Vitória</span>
                                 </li>
                              </ul>
                           </div>

                           <div className="p-4 bg-hxh-green/10 border border-hxh-green/30 rounded-2xl space-y-2">
                              <p className="text-hxh-green font-bold uppercase tracking-widest text-[8px] flex items-center gap-2">
                                 <Zap size={12} /> Rentabilidade do Lutador:
                              </p>
                              <ul className="space-y-1.5 text-[9px]">
                                 <li className="leading-tight">
                                    <span className="text-white font-bold">Royalties de Emissão:</span> Você recebe <span className="text-hxh-green font-bold">20% do valor</span> de cada cota sua comprada por outros Hunters.
                                 </li>
                                 <li className="leading-tight">
                                    <span className="text-white font-bold">Valorização Temporal:</span> Seu valor de mercado sobe conforme você vence lutas e sobe andares, aumentando o patrimônio total da sua marca.
                                 </li>
                                 <li className="pt-2 border-t border-hxh-green/20 text-yellow-500/80 italic font-bold">
                                    ⚠️ ATENÇÃO: Quem controla NPCs não recebe royalties. Ganhos sobre NPCs ocorrem apenas via apostas em lutas Jogador VS NPC.
                                 </li>
                              </ul>
                           </div>

                           <div className="flex gap-4 items-start p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                              <Shield size={16} className="text-red-500 shrink-0 mt-1" />
                              <p className="text-[9px] text-gray-500 italic">
                                 "Compreendo que 20% de toda valorização de mercado gerada pela venda das minhas cotas será revertida para o fundo de manejo da Torre Celestial."
                              </p>
                           </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setStep('INPUT')}
                        className="w-full py-5 bg-hxh-blue text-white font-black uppercase tracking-[0.3em] rounded-2xl hover:shadow-[0_0_40px_rgba(33,150,243,0.4)] transition-all text-xs flex items-center justify-center gap-3 group"
                    >
                        Assinar e Prosseguir <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    <button onClick={onClose} className="w-full text-[9px] text-gray-600 hover:text-white uppercase font-bold tracking-widest transition-colors">
                       Recusar Admissão
                    </button>
                </div>
            )}

            {step === 'INPUT' && (
                <div className="space-y-5">
                    {/* Origem */}
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                        <label className="text-[9px] text-gray-500 uppercase font-black mb-3 block tracking-widest text-center">Origem do Lutador</label>
                        <div className="flex flex-col gap-2">
                            {(['SELF', 'OTHER', 'NPC'] as const).map(m => {
                                const labels = { SELF: 'Pertence a Você', OTHER: 'Pertence a Outro Hunter', NPC: 'NPC da Torre Celestial' };
                                const adminOnly = m !== 'SELF';
                                const active = mode === m;
                                return (
                                    <button key={m}
                                        onClick={() => {
                                            if (adminOnly && !isAdmin) return alert('Apenas Juízes (Staff) podem usar esta opção.');
                                            setMode(m);
                                            setPickedUser(null);
                                            setSelectedId(null);
                                            setFormData({ name: '', nenType: 'Enhancement', imageUrl: '', floor: 1, level: 1 });
                                        }}
                                        className={`py-2 px-3 text-[10px] uppercase font-bold border rounded-lg transition-all text-left flex items-center justify-between
                                            ${adminOnly && !isAdmin ? 'opacity-30 cursor-not-allowed' : ''}
                                            ${active
                                                ? m === 'NPC' ? 'bg-purple-500/20 border-purple-500 text-white' : 'bg-hxh-blue/20 border-hxh-blue text-white'
                                                : 'bg-black/20 border-white/10 text-gray-500 hover:border-white/30'}`}
                                    >
                                        {labels[m]}
                                        {adminOnly && <span className="text-[8px] text-gray-600 uppercase tracking-widest">Admin</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* SELF: lista de personagens do usuário */}
                    {mode === 'SELF' && (
                        <CharPickerSection
                            label="Seus Personagens"
                            chars={myChars}
                            loading={loadingChars}
                            selectedId={selectedId}
                            onPick={pickChar}
                            emptyText="Nenhum personagem encontrado. Crie um no HxH5e RPG."
                        />
                    )}

                    {/* OTHER: lista de usuários → personagens */}
                    {mode === 'OTHER' && isAdmin && (
                        <>
                            {!pickedUser ? (
                                <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                                    <label className="text-[9px] text-gray-500 uppercase font-black block tracking-widest">Selecionar Hunter</label>
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={e => setUserSearch(e.target.value)}
                                        placeholder="Buscar por nome..."
                                        className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none focus:border-hxh-blue"
                                    />
                                    <div className="max-h-44 overflow-y-auto space-y-1">
                                        {loadingChars && <p className="text-xs text-gray-500 text-center py-2">Carregando...</p>}
                                        {allUsers
                                            .filter(u => (u.username || u.name || '').toLowerCase().includes(userSearch.toLowerCase()))
                                            .map(u => (
                                                <button key={u.id} onClick={() => selectUser(u)}
                                                    className="w-full text-left px-3 py-2 rounded-lg bg-black/40 hover:bg-hxh-blue/10 border border-transparent hover:border-hxh-blue/30 transition-all">
                                                    <span className="text-white text-xs font-bold block">{u.username || u.name}</span>
                                                    <span className="text-gray-600 text-[10px] font-mono">{u.discord_id || u.id}</span>
                                                </button>
                                            ))
                                        }
                                        {!loadingChars && allUsers.length === 0 && (
                                            <p className="text-xs text-gray-500 text-center py-2">Nenhum usuário no sistema ainda.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 bg-hxh-blue/10 border border-hxh-blue/30 rounded-xl px-4 py-2">
                                        <Users size={14} className="text-hxh-blue" />
                                        <span className="text-white text-xs font-bold">{pickedUser.username || pickedUser.name}</span>
                                        <button onClick={() => { setPickedUser(null); setSelectedId(null); }}
                                            className="ml-auto text-gray-500 hover:text-white text-[10px] uppercase">Trocar</button>
                                    </div>
                                    <CharPickerSection
                                        label={`Personagens de ${pickedUser.username || pickedUser.name}`}
                                        chars={otherChars}
                                        loading={loadingChars}
                                        selectedId={selectedId}
                                        onPick={pickChar}
                                        emptyText="Este usuário não tem personagens cadastrados."
                                    />
                                </>
                            )}
                        </>
                    )}

                    {/* NPC: personagens do admin */}
                    {mode === 'NPC' && isAdmin && (
                        <CharPickerSection
                            label="NPCs Disponíveis (conta Admin)"
                            chars={npcChars}
                            loading={loadingChars}
                            selectedId={selectedId}
                            onPick={pickChar}
                            emptyText="Nenhum personagem na conta do Admin."
                        />
                    )}

                    {/* Form fields — preenchidos ao selecionar, editáveis */}
                    <div className="space-y-3">
                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 focus-within:border-hxh-blue transition-all">
                            <label className="text-[9px] text-gray-500 uppercase font-black mb-2 block tracking-widest">Nome de Guerra</label>
                            <input autoFocus type="text" value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="Ex: Killua Zoldyck"
                                className="bg-transparent text-white font-display font-bold text-xl w-full outline-none placeholder:opacity-20 uppercase italic" />
                        </div>

                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 focus-within:border-hxh-blue transition-all">
                            <label className="text-[9px] text-gray-500 uppercase font-black mb-2 block tracking-widest">Tipo de Nen</label>
                            <select className="w-full bg-transparent text-white text-sm outline-none font-bold uppercase"
                                value={formData.nenType} onChange={e => setFormData({...formData, nenType: e.target.value})}>
                                <option className="bg-[#0a0a0a]" value="None">Não Desperto</option>
                                <option className="bg-[#0a0a0a]" value="Enhancement">Reforço</option>
                                <option className="bg-[#0a0a0a]" value="Transmutation">Transmutação</option>
                                <option className="bg-[#0a0a0a]" value="Emission">Emissão</option>
                                <option className="bg-[#0a0a0a]" value="Conjuration">Materialização</option>
                                <option className="bg-[#0a0a0a]" value="Manipulation">Manipulação</option>
                                <option className="bg-[#0a0a0a]" value="Specialization">Especialização</option>
                            </select>
                        </div>

                        {isAdmin && (
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black/40 border border-white/10 rounded-xl p-4 focus-within:border-hxh-blue transition-all">
                                    <label className="text-[9px] text-gray-500 uppercase font-black mb-2 block tracking-widest">Nível (0-12)</label>
                                    <input type="number" min="0" max="12" value={formData.level}
                                        onChange={e => setFormData({...formData, level: Math.max(0, Math.min(12, parseInt(e.target.value)||0))})}
                                        className="bg-transparent text-white font-mono text-center w-full outline-none text-xl" />
                                </div>
                                <div className="bg-black/40 border border-white/10 rounded-xl p-4 focus-within:border-hxh-blue transition-all">
                                    <label className="text-[9px] text-gray-500 uppercase font-black mb-2 block tracking-widest text-center">Andar</label>
                                    <select value={formData.floor} onChange={e => setFormData({...formData, floor: parseInt(e.target.value)||1})}
                                        className="w-full bg-transparent text-white font-mono text-center outline-none text-xl appearance-none cursor-pointer">
                                        {[1,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,251].map(f => (
                                            <option key={f} className="bg-[#0a0a0a]" value={f}>{f >= 210 ? `👑 ${f}` : f}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 focus-within:border-hxh-blue transition-all">
                            <label className="text-[9px] text-gray-500 uppercase font-black mb-2 block tracking-widest">URL do Avatar (Opcional)</label>
                            <input type="text" value={formData.imageUrl}
                                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                                placeholder="https://..."
                                className="bg-transparent text-white font-mono text-xs w-full outline-none" />
                        </div>
                    </div>

                    <button onClick={handleRegister} disabled={!formData.name}
                        className="w-full py-4 bg-hxh-blue text-white font-black uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_30px_rgba(33,150,243,0.4)] transition-all disabled:opacity-30 disabled:cursor-not-allowed text-xs">
                        Assinar Contrato de Luta
                    </button>
                </div>
            )}
            {step === 'PROCESSING' && <Loader text="Validando Licença Hunter..." />}
            {step === 'SUCCESS' && <SuccessMessage text="Registro Efetuado! Prepare-se para subir de andar." />}
        </BaseModal>
    );
};

export const V2EditFighterModal: React.FC<ModalProps & { fighter: any }> = ({ fighter, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: fighter.name,
        floor: fighter.floor,
        level: fighter.level,
        nenType: fighter.nenType,
        imageUrl: fighter.imageUrl,
        popularity: fighter.popularity
    });
    const [step, setStep] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS'>('INPUT');

    const handleUpdate = async () => {
        setStep('PROCESSING');
        try {
            await v2Service.updateFighter(fighter.id, formData);
            setTimeout(() => {
                setStep('SUCCESS');
                setTimeout(() => onSuccess(null), 1500);
            }, 1000);
        } catch (e: any) {
            alert(e.message);
            setStep('INPUT');
        }
    };

    return (
        <BaseModal title="Editar Lutador" onClose={onClose}>
            {step === 'INPUT' && (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Nome do Lutador</label>
                            <input 
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-hxh-blue"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Nível (0-12)</label>
                                <input 
                                    type="number"
                                    min="0"
                                    max="12"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-hxh-blue"
                                    value={isNaN(formData.level) ? '' : formData.level}
                                    onChange={e => {
                                        const val = Math.max(0, Math.min(12, parseInt(e.target.value) || 0));
                                        setFormData({...formData, level: val});
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Andar</label>
                                <select 
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-hxh-blue appearance-none cursor-pointer"
                                    value={formData.floor || 1}
                                    onChange={e => setFormData({...formData, floor: parseInt(e.target.value) || 1})}
                                >
                                    <option value="1">1-9</option>
                                    <option value="10">10-19</option>
                                    <option value="20">20-29</option>
                                    <option value="30">30-39</option>
                                    <option value="40">40-49</option>
                                    <option value="50">50-59</option>
                                    <option value="60">60-69</option>
                                    <option value="70">70-79</option>
                                    <option value="80">80-89</option>
                                    <option value="90">90-99</option>
                                    <option value="100">100-109</option>
                                    <option value="110">110-119</option>
                                    <option value="120">120-129</option>
                                    <option value="130">130-139</option>
                                    <option value="140">140-149</option>
                                    <option value="150">150-159</option>
                                    <option value="160">160-169</option>
                                    <option value="170">170-179</option>
                                    <option value="180">180-189</option>
                                    <option value="190">190-199</option>
                                    <option value="200">200-210</option>
                                    <option value="211">211-220</option>
                                    <option value="221">221-230</option>
                                    <option value="231">231-240</option>
                                    <option value="241">241-250</option>
                                    <option value="210">👑 210</option>
                                    <option value="220">👑 220</option>
                                    <option value="230">👑 230</option>
                                    <option value="240">👑 240</option>
                                    <option value="250">👑 250</option>
                                    <option value="251">👑 251 (Absoluto)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Tipo de Nen</label>
                            <select 
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-hxh-blue"
                                value={formData.nenType}
                                onChange={e => setFormData({...formData, nenType: e.target.value})}
                            >
                                <option value="None">Não Desperto</option>
                                <option value="Enhancement">Reforço</option>
                                <option value="Transmutation">Transmutação</option>
                                <option value="Emission">Emissão</option>
                                <option value="Conjuration">Materialização</option>
                                <option value="Manipulation">Manipulação</option>
                                <option value="Specialization">Especialização</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">URL da Imagem</label>
                            <input 
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-xs outline-none focus:border-hxh-blue"
                                value={formData.imageUrl}
                                onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="text-[9px] text-gray-500 uppercase font-bold mb-1 block">Popularidade</label>
                            <input 
                                type="number"
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-hxh-blue"
                                value={isNaN(formData.popularity) ? '' : formData.popularity}
                                onChange={e => {
                                    const val = parseInt(e.target.value);
                                    setFormData({...formData, popularity: isNaN(val) ? NaN : val});
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button 
                            onClick={handleUpdate}
                            className="flex-1 py-4 bg-hxh-blue text-white font-bold uppercase tracking-widest text-xs rounded-xl"
                        >
                            Salvar Alterações
                        </button>
                        <button 
                            onClick={handleUpdate}
                            className="px-6 bg-white/5 text-hxh-blue border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            title="Recalcular valor com base na matriz"
                        >
                            <TrendingUp size={16} />
                            <span className="text-[10px] font-black italic">!</span>
                        </button>
                    </div>
                </div>
            )}
            {step === 'PROCESSING' && <Loader text="Atualizando Registros..." />}
            {step === 'SUCCESS' && <SuccessMessage text="Lutador Atualizado!" />}
        </BaseModal>
    );
};

// Internal Components
const BaseModal = ({ title, children, onClose, disableOverlayClick }: { title: string, children: React.ReactNode, onClose: () => void, disableOverlayClick?: boolean }) => (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-sm"
    >
        <div className="absolute inset-0" onClick={disableOverlayClick ? undefined : onClose} />
        <motion.div 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-3xl md:rounded-[2.5rem] w-full max-w-md max-h-[90vh] flex flex-col relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-hxh-blue to-transparent" />
            <div className="flex items-center justify-between p-6 md:p-8 pb-4 md:pb-6 shrink-0">
                <h2 className="text-lg md:text-xl font-display font-black text-white italic uppercase tracking-tighter leading-tight pr-4">{title}</h2>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors shrink-0"><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-0 custom-scrollbar">
                {children}
            </div>
        </motion.div>
    </motion.div>
);

const Loader = ({ text }: { text: string }) => (
    <div className="py-20 flex flex-col items-center gap-6 animate-fade-in">
        <div className="w-16 h-16 border-4 border-hxh-blue border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(33,150,243,0.2)]"></div>
        <p className="text-hxh-blue font-mono text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">{text}</p>
    </div>
);

const SuccessMessage = ({ text }: { text: string }) => (
    <div className="py-16 text-center animate-fade-in">
        <div className="w-20 h-20 bg-[#00ff41]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#00ff41]/30">
            <CheckCircle size={40} className="text-[#00ff41]" />
        </div>
        <h3 className="text-white font-display font-bold text-lg uppercase tracking-tight mb-2">{text}</h3>
        <p className="text-gray-500 text-[10px] uppercase font-mono tracking-widest">Sincronização Completa</p>
    </div>
);
