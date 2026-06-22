import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { saveSession } from '../src/supabase';
import { DISCORD_ROLES } from '../constants';

interface Props {
  onLogin: (user: any) => void;
}

export const DiscordLogin: React.FC<Props> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type !== 'DISCORD_AUTH_SUCCESS') return;

      const { user, token } = event.data.payload;
      setIsLoading(true);
      setRoleError(null);

      try {
        const userRoles = user.roles || [];
        const hasJudge    = DISCORD_ROLES.JUDGE.some((id: string) => userRoles.includes(id));
        const hasInvestor = DISCORD_ROLES.INVESTOR.some((id: string) => userRoles.includes(id));

        if (!hasJudge && !hasInvestor) {
          setRoleError('Você precisa do cargo de Juiz ou Investidor para acessar a Torre Celestial.');
          return;
        }

        const sessionUser = {
          id:            user.id,
          username:      user.global_name || user.username,
          discriminator: user.discriminator,
          avatar:        user.avatar,
          roles:         userRoles,
          email:         user.email,
        };

        saveSession(sessionUser, token || '');
        onLogin(sessionUser);
      } catch (e: any) {
        console.error('[AUTH]', e);
        setRoleError('Erro ao validar sessão. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLogin]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/discord/url');
      if (!res.ok) throw new Error(`Servidor respondeu ${res.status}`);
      const { url } = await res.json();

      const w = 500, h = 750;
      const left = window.screen.width  / 2 - w / 2;
      const top  = window.screen.height / 2 - h / 2;
      const popup = window.open(url, 'discord_auth', `width=${w},height=${h},left=${left},top=${top}`);

      if (!popup) {
        alert('O bloqueador de popups impediu a janela do Discord. Por favor, autorize popups para este site.');
        setIsLoading(false);
      }
    } catch (e: any) {
      alert(`Erro ao iniciar autenticação: ${e.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#2C2F33] border border-[#23272A] p-8 rounded-xl max-w-md w-full shadow-[0_0_50px_rgba(88,101,242,0.2)] text-center relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-1 bg-[#5865F2]" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#5865F2]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center mb-6 text-[#5865F2]">
          <ShieldCheck size={64} />
        </div>

        <h1 className="text-2xl font-display font-bold text-white mb-2">Acesso Restrito</h1>
        <p className="text-gray-400 mb-8 font-body">
          Conecte-se com sua conta Discord para acessar o terminal de investimentos da Arena Celestial.
        </p>

        {roleError && (
          <div className="bg-red-900/40 border border-red-500 text-red-100 p-4 rounded-lg text-sm mb-6 font-bold tracking-tight uppercase">
            {roleError}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-60 text-white font-bold py-4 px-4 rounded transition-all flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <><Loader2 className="animate-spin" size={20} /> Autenticando...</>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/>
              </svg>
              Entrar com Discord
            </>
          )}
        </button>

        <p className="mt-4 text-[10px] text-gray-600 uppercase tracking-widest">
          Ambiente seguro via Hunter Association Network
        </p>
      </div>
    </div>
  );
};
