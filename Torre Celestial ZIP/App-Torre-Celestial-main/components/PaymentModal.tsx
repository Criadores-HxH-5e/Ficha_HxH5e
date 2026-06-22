import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle, ArrowRight, Wallet, Banknote, Lock, QrCode, Copy, Landmark, Smartphone } from 'lucide-react';
import { EXCHANGE_RATE, WITHDRAW_TAX_RATE, MIN_WITHDRAW_J, DISCORD_CONFIG, ADMIN_CONFIG } from '../constants.ts';
import { Character } from '../types.ts';

interface Props {
  mode: 'DEPOSIT' | 'WITHDRAW';
  character: Character;
  onClose: () => void;
  onConfirm: (amountJenny: number) => void;
}

export const PaymentModal: React.FC<Props> = ({ mode, character, onClose, onConfirm }) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  
  // Extended steps to include Withdraw sub-flows
  const [step, setStep] = useState<'INPUT' | 'PIX_PAYMENT' | 'WITHDRAW_METHOD' | 'WITHDRAW_DETAILS' | 'PROCESSING' | 'SUCCESS'>('INPUT');
  
  // Withdraw Specific State
  const [withdrawMethod, setWithdrawMethod] = useState<'PIX' | 'BANK' | null>(null);
  
  // Pix State
  const [withdrawPixKey, setWithdrawPixKey] = useState('');

  // Bank Data State
  const [bankDetails, setBankDetails] = useState({
      bank: '',
      agency: '',
      account: '',
      fullName: '',
      cpf: ''
  });

  // Logic Variables
  const amountBRL = parseFloat(inputValue) || 0;
  const depositJenny = Math.floor(amountBRL * EXCHANGE_RATE);
  
  // Withdraw Calc
  const currentJenny = character.jenny;
  const withdrawGrossBRL = currentJenny / EXCHANGE_RATE;
  const withdrawTaxBRL = withdrawGrossBRL * WITHDRAW_TAX_RATE;
  const withdrawNetBRL = withdrawGrossBRL - withdrawTaxBRL;

  const handleDepositFlow = () => {
      setStep('PIX_PAYMENT');
  };

  const handlePixConfirm = async () => {
    alert("Em até 3min o saldo irá entrar em sua conta");

    if (DISCORD_CONFIG.OUTBOUND_WEBHOOK_URL) {
        try {
            fetch(DISCORD_CONFIG.OUTBOUND_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `💰 **DEPÓSITO INICIADO**\nUsuário: ${character.name}\nValor: R$ ${amountBRL.toFixed(2)} (${depositJenny.toLocaleString()} J)\nStatus: Aguardando processamento (2min)`
                })
            }).catch(err => console.error("Webhook error:", err));
        } catch (e) {
            console.error(e);
        }
    }

    setProcessing(true);
    setStep('PROCESSING');
    
    setTimeout(() => {
      setProcessing(false);
      setStep('SUCCESS');

      setTimeout(() => {
          onConfirm(depositJenny);
          console.log("Saldo depositado após 2min.");
      }, 120000); // 120 seconds

    }, 2000);
  };

  const handleWithdrawStart = () => {
      setStep('WITHDRAW_METHOD');
  };

  const handleSelectWithdrawMethod = (method: 'PIX' | 'BANK') => {
      setWithdrawMethod(method);
      setStep('WITHDRAW_DETAILS');
  };

  const handleWithdrawFinalConfirm = () => {
    let finalDataString = '';

    if (withdrawMethod === 'PIX') {
        if (!withdrawPixKey) {
            alert("Por favor, informe a chave Pix.");
            return;
        }
        finalDataString = `**MÉTODO:** PIX\n**CHAVE:** \`${withdrawPixKey}\``;
    } else {
        if (!bankDetails.bank || !bankDetails.account || !bankDetails.fullName || !bankDetails.cpf) {
            alert("Por favor, preencha todos os dados obrigatórios.");
            return;
        }
        finalDataString = `**MÉTODO:** TRANSFERÊNCIA BANCÁRIA
----------------------------------
**BANCO:** ${bankDetails.bank}
**AGÊNCIA:** ${bankDetails.agency}
**CONTA:** ${bankDetails.account}
**NOME:** ${bankDetails.fullName}
**CPF:** ${bankDetails.cpf}`;
    }

    setProcessing(true);
    setStep('PROCESSING');
    
    // Ping Admin
    const adminPing = ADMIN_CONFIG.ADMIN_IDS.length > 0 ? `<@${ADMIN_CONFIG.ADMIN_IDS[0]}>` : '@admin';

    if (DISCORD_CONFIG.OUTBOUND_WEBHOOK_URL) {
        try {
            fetch(DISCORD_CONFIG.OUTBOUND_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `${adminPing} 💸 **SOLICITAÇÃO DE SAQUE RECEBIDA**`,
                    embeds: [{
                        title: "📋 Dados para Transferência",
                        description: `O usuário **${character.name}** solicitou um saque.\n\n**VALOR LÍQUIDO:** R$ ${withdrawNetBRL.toFixed(2)}\n\n${finalDataString}`,
                        color: 15158332, // Red/Orange color
                        footer: { text: "Verifique a veracidade antes de transferir." },
                        timestamp: new Date().toISOString()
                    }]
                })
            }).catch(e => console.error(e));
        } catch (e) {}
    }

    setTimeout(() => {
      setProcessing(false);
      setStep('SUCCESS');
      onConfirm(-currentJenny); // Removes all funds
    }, 2000);
  };

  const isValidDeposit = mode === 'DEPOSIT' && amountBRL >= 0.50;
  const isMinBalanceMet = currentJenny >= MIN_WITHDRAW_J;
  const isValidWithdraw = mode === 'WITHDRAW' && isMinBalanceMet;

  const handleCopyKey = () => {
      navigator.clipboard.writeText("hxh5ebrasil@gmail.com");
      alert("Chave copiada!");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#111] border border-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="bg-[#050505] p-4 flex justify-between items-center border-b border-gray-800 sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <Wallet className={mode === 'DEPOSIT' ? "text-hxh-green" : "text-hxh-accent"} size={20} />
                <h2 className="text-white font-display font-bold uppercase text-sm md:text-base">
                    {mode === 'DEPOSIT' ? 'Banco da Torre Celestial' : 'Convert Hands: Saque'}
                </h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6">
            
            {step === 'INPUT' && (
                <div className="space-y-6">
                    {/* DEPOSIT MODE */}
                    {mode === 'DEPOSIT' && (
                        <>
                            <div className="text-center mb-4">
                                <p className="text-gray-400 text-sm mb-2">Digite o valor em Reais (R$) para comprar Jenny.</p>
                                <p className="text-[10px] text-gray-500 uppercase">Mínimo: R$ 0,50</p>
                            </div>

                            <div className="bg-black border border-gray-700 rounded-lg p-4 flex items-center gap-2 focus-within:border-hxh-green transition-colors">
                                <span className="text-gray-400 font-bold">R$</span>
                                <input 
                                    type="number" 
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="0,00"
                                    min="0.50"
                                    step="0.10"
                                    className="bg-transparent text-white font-display font-bold text-2xl w-full outline-none"
                                />
                            </div>

                            <div className="bg-hxh-green/10 border border-hxh-green/30 rounded-lg p-4 text-center mt-4">
                                <span className="text-gray-400 text-xs uppercase block mb-1">Você Recebe</span>
                                <span className="text-hxh-green font-display font-black text-3xl">
                                    {depositJenny.toLocaleString()} J
                                </span>
                            </div>

                            <button 
                                onClick={handleDepositFlow}
                                disabled={!isValidDeposit}
                                className={`w-full py-4 rounded font-bold uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2
                                    ${isValidDeposit 
                                        ? 'bg-hxh-green text-black hover:brightness-110 shadow-[0_0_20px_rgba(0,255,65,0.4)]' 
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                                `}
                            >
                                <CreditCard size={18} /> INVESTIR
                            </button>
                        </>
                    )}

                    {/* WITHDRAW MODE - STEP 1 */}
                    {mode === 'WITHDRAW' && (
                        <>
                             <div className="text-center mb-4">
                                <p className="text-gray-400 text-sm">Converta suas fichas (Jenny) de volta para moeda real.</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                                    <span className="text-gray-400 text-sm">Saldo Real Atual</span>
                                    <span className={`font-bold ${currentJenny < MIN_WITHDRAW_J ? 'text-red-500' : 'text-white'}`}>
                                        {currentJenny.toLocaleString()} J
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center bg-gray-900 p-3 rounded">
                                    <span className="text-gray-400 text-sm">Conversão Bruta</span>
                                    <span className="text-white font-bold">R$ {withdrawGrossBRL.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between items-center bg-red-900/20 border border-red-900/50 p-3 rounded">
                                    <span className="text-red-400 text-sm">Taxa da Torre ({(WITHDRAW_TAX_RATE * 100)}%)</span>
                                    <span className="text-red-400 font-bold">- R$ {withdrawTaxBRL.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center mt-2">
                                <span className="text-gray-400 text-xs uppercase block mb-1">Valor Líquido a Receber</span>
                                <span className="text-white font-display font-black text-3xl">
                                    R$ {Math.max(0, withdrawNetBRL).toFixed(2)}
                                </span>
                            </div>

                            {!isMinBalanceMet && (
                                <div className="text-[10px] text-red-500 text-center mt-1 bg-red-900/10 p-2 rounded">
                                    * Mínimo de {MIN_WITHDRAW_J} J (R$ 5,00) de Saldo Real necessário.
                                </div>
                            )}

                            <button 
                                onClick={handleWithdrawStart}
                                disabled={!isValidWithdraw}
                                className={`w-full py-4 rounded font-bold uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2
                                    ${isValidWithdraw 
                                        ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
                                `}
                            >
                                <Banknote size={18} /> Realizar Saque
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* WITHDRAW: METHOD SELECTION */}
            {step === 'WITHDRAW_METHOD' && (
                <div className="animate-fade-in space-y-4">
                    <h3 className="text-white font-display font-bold text-center mb-6">Como deseja receber?</h3>
                    
                    <button 
                        onClick={() => handleSelectWithdrawMethod('PIX')}
                        className="w-full bg-hxh-green/10 border border-hxh-green/50 hover:bg-hxh-green hover:text-black hover:border-hxh-green text-hxh-green p-6 rounded-lg transition-all flex items-center gap-4 group"
                    >
                        <div className="bg-black/30 p-3 rounded-full group-hover:bg-black/10">
                            <Smartphone size={24} />
                        </div>
                        <div className="text-left">
                            <div className="font-bold uppercase tracking-wider">Informar Chave Pix</div>
                            <div className="text-xs opacity-70">Transferência instantânea</div>
                        </div>
                    </button>

                    <button 
                        onClick={() => handleSelectWithdrawMethod('BANK')}
                        className="w-full bg-gray-800 border border-gray-700 hover:bg-white hover:text-black hover:border-white text-white p-6 rounded-lg transition-all flex items-center gap-4 group"
                    >
                        <div className="bg-black/30 p-3 rounded-full group-hover:bg-black/10">
                            <Landmark size={24} />
                        </div>
                        <div className="text-left">
                            <div className="font-bold uppercase tracking-wider">Informar Dados Bancários</div>
                            <div className="text-xs opacity-70">TED/DOC (Pode levar mais tempo)</div>
                        </div>
                    </button>

                    <button onClick={() => setStep('INPUT')} className="w-full text-gray-500 hover:text-white text-xs uppercase mt-4">
                        Voltar
                    </button>
                </div>
            )}

            {/* WITHDRAW: DETAILS FORM */}
            {step === 'WITHDRAW_DETAILS' && (
                <div className="animate-fade-in space-y-5">
                    <h3 className="text-white font-display font-bold text-center mb-2">
                        {withdrawMethod === 'PIX' ? 'Dados do Pix' : 'Dados Bancários'}
                    </h3>

                    {withdrawMethod === 'PIX' ? (
                        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                            <label className="text-hxh-green text-xs uppercase font-bold block mb-2">Chave Pix (CPF/Email/Tel)</label>
                            <input 
                                autoFocus
                                className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-hxh-green outline-none text-lg"
                                placeholder="Digite sua chave..."
                                value={withdrawPixKey}
                                onChange={(e) => setWithdrawPixKey(e.target.value)}
                            />
                            <p className="text-[10px] text-gray-500 mt-2">
                                Verifique atentamente. O pagamento será enviado para esta chave.
                            </p>
                        </div>
                    ) : (
                        // SEPARATED BANK FIELDS AS REQUESTED
                        <div className="flex flex-col gap-4">
                            
                            {/* Bloco 1: Banco */}
                            <div className="bg-gray-900 border border-gray-800 rounded p-3 hover:border-gray-600 transition-colors">
                                <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Nome do Banco / Código</label>
                                <input 
                                    className="w-full bg-transparent border-b border-gray-700 pb-1 text-white focus:border-white outline-none text-sm placeholder-gray-600"
                                    placeholder="Ex: Nubank (260), Itaú (341)"
                                    value={bankDetails.bank}
                                    onChange={(e) => setBankDetails({...bankDetails, bank: e.target.value})}
                                />
                            </div>

                            {/* Bloco 2: Agência e Conta (Lado a lado mas separados) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-900 border border-gray-800 rounded p-3 hover:border-gray-600 transition-colors">
                                    <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Agência</label>
                                    <input 
                                        className="w-full bg-transparent border-b border-gray-700 pb-1 text-white focus:border-white outline-none text-sm placeholder-gray-600"
                                        placeholder="0001"
                                        value={bankDetails.agency}
                                        onChange={(e) => setBankDetails({...bankDetails, agency: e.target.value})}
                                    />
                                </div>
                                <div className="bg-gray-900 border border-gray-800 rounded p-3 hover:border-gray-600 transition-colors">
                                    <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Conta (c/ dígito)</label>
                                    <input 
                                        className="w-full bg-transparent border-b border-gray-700 pb-1 text-white focus:border-white outline-none text-sm placeholder-gray-600"
                                        placeholder="123456-7"
                                        value={bankDetails.account}
                                        onChange={(e) => setBankDetails({...bankDetails, account: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Bloco 3: Nome Completo */}
                            <div className="bg-gray-900 border border-gray-800 rounded p-3 hover:border-gray-600 transition-colors">
                                <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">Nome do Titular</label>
                                <input 
                                    className="w-full bg-transparent border-b border-gray-700 pb-1 text-white focus:border-white outline-none text-sm placeholder-gray-600"
                                    placeholder="Como consta no banco"
                                    value={bankDetails.fullName}
                                    onChange={(e) => setBankDetails({...bankDetails, fullName: e.target.value})}
                                />
                            </div>

                            {/* Bloco 4: CPF */}
                            <div className="bg-gray-900 border border-gray-800 rounded p-3 hover:border-gray-600 transition-colors">
                                <label className="text-gray-400 text-[10px] uppercase font-bold block mb-1">CPF do Titular</label>
                                <input 
                                    className="w-full bg-transparent border-b border-gray-700 pb-1 text-white focus:border-white outline-none text-sm placeholder-gray-600"
                                    placeholder="000.000.000-00"
                                    value={bankDetails.cpf}
                                    onChange={(e) => setBankDetails({...bankDetails, cpf: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    <div className="bg-yellow-900/10 border border-yellow-900/30 p-3 rounded flex items-start gap-2 mt-2">
                         <ShieldCheck className="text-yellow-600 shrink-0" size={16} />
                         <p className="text-yellow-600 text-[10px] leading-relaxed">
                             O Administrador (ID Discord) receberá estes dados via canal seguro. 
                             Valor do saque: <strong>R$ {withdrawNetBRL.toFixed(2)}</strong>.
                         </p>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button onClick={() => setStep('WITHDRAW_METHOD')} className="flex-1 bg-gray-800 text-gray-400 font-bold py-3 rounded uppercase hover:text-white">
                            Voltar
                        </button>
                        <button onClick={handleWithdrawFinalConfirm} className="flex-[2] bg-white text-black font-bold py-3 rounded uppercase tracking-widest hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            Confirmar Saque
                        </button>
                    </div>
                </div>
            )}

            {step === 'PIX_PAYMENT' && (
                <div className="space-y-4 animate-fade-in flex flex-col items-center">
                    <div className="bg-white p-2 rounded-xl mb-2 w-full max-w-[280px] shadow-2xl transform transition-transform hover:scale-105">
                        <img src="https://i.pinimg.com/1200x/87/c5/67/87c567faf4cde29658a1470df9508abc.jpg" alt="Pix QR Code" className="w-full h-auto object-contain rounded-lg" />
                    </div>
                    
                    <div className="flex items-center gap-2 text-hxh-green text-xs font-mono bg-hxh-green/10 px-3 py-1 rounded border border-hxh-green/30 mb-2">
                        <QrCode size={14} />
                        <span>QR Code Oficial</span>
                    </div>

                    <div className="w-full bg-gray-900 border border-gray-800 rounded p-4">
                        <label className="text-gray-500 text-[10px] uppercase font-bold mb-1 block">Chave Pix (E-mail)</label>
                        <div className="flex items-center justify-between gap-2">
                            <code className="text-white font-mono text-sm">hxh5ebrasil@gmail.com</code>
                            <button className="text-gray-400 hover:text-white transition-colors p-1" title="Copiar" onClick={handleCopyKey}>
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <button onClick={handlePixConfirm} className="w-full bg-hxh-green text-black font-bold py-4 rounded uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,65,0.4)] mt-2">
                        <CheckCircle size={18} /> Confirmar Pagamento
                    </button>
                </div>
            )}

            {step === 'PROCESSING' && (
                <div className="text-center py-12 flex flex-col items-center">
                    <ShieldCheck size={48} className="text-hxh-green animate-pulse mb-4" />
                    <h3 className="text-white font-display text-lg mb-2">Enviando Solicitação...</h3>
                    <p className="text-gray-500 text-sm">Contatando Administrador via Neural Network...</p>
                </div>
            )}

            {step === 'SUCCESS' && (
                <div className="text-center py-8">
                    <div className="flex justify-center mb-4">
                        <CheckCircle size={64} className={mode === 'DEPOSIT' ? "text-hxh-green animate-bounce" : "text-white animate-bounce"} />
                    </div>
                    <h2 className="text-2xl text-white font-display font-bold mb-2">
                        {mode === 'DEPOSIT' ? 'Investimento Registrado!' : 'Saque Solicitado!'}
                    </h2>
                    <p className="text-gray-400 mb-6 text-sm">
                        {mode === 'DEPOSIT' 
                            ? 'Sua solicitação foi enviada. O saldo será creditado automaticamente em até 3 minutos.' 
                            : 'O Administrador foi notificado com seus dados. O prazo para transferência é de até 1 hora.'}
                    </p>
                    <button onClick={onClose} className="bg-gray-800 text-white hover:bg-gray-700 font-bold py-3 px-8 rounded uppercase tracking-widest transition-colors">
                        Fechar
                    </button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};