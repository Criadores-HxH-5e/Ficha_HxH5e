        function renderLogin(container) {
            container.innerHTML = `
                <div class="h-full flex flex-col items-center justify-center p-6 bg-[#0a0a0f] relative overflow-hidden">
                    <div class="absolute inset-0 bg-[url('https://i.pinimg.com/originals/2b/86/e6/2b86e680506079632730605937965050.gif')] bg-cover bg-center opacity-10"></div>
                    <div class="relative z-10 w-full max-w-sm bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(88,101,242,0.15)] animate-in zoom-in duration-500">
                        <div class="mb-6 flex justify-center">
                            <div class="w-20 h-20 rounded-2xl bg-gray-800 flex items-center justify-center border border-gray-700 shadow-lg relative">
                                <i data-lucide="shield" size="40" class="text-neon-green absolute animate-pulse-slow"></i>
                                <i data-lucide="swords" size="24" class="text-white relative z-10"></i>
                            </div>
                        </div>
                        <h1 class="font-display font-black text-3xl text-white tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] leading-tight">FICHA<br>HxH5e<br>RPG</h1>
                        <p class="text-xs text-gray-400 uppercase tracking-widest font-bold mb-8">Acesso Restrito ao Sistema</p>
                        
                        <div class="space-y-4">
                            <button onclick="loginDiscord()" class="w-full py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-black font-display tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(88,101,242,0.4)] flex items-center justify-center gap-3 group">
                                <i data-lucide="gamepad-2" class="group-hover:rotate-12 transition-transform"></i>
                                LOGIN COM DISCORD
                            </button>
                            <button onclick="loginGoogle()" class="w-full py-4 bg-white hover:bg-gray-100 text-gray-800 font-black font-display tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 group">
                                <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
                                LOGIN COM GOOGLE
                            </button>
                            <button onclick="bypassLogin()" class="w-full py-3 bg-transparent border border-gray-700 text-gray-500 font-bold uppercase tracking-wider rounded-xl hover:text-white hover:border-gray-500 transition-all text-[10px]">
                                Modo de Teste (Sem Login)
                            </button>
                            <p class="text-[9px] text-gray-500 leading-relaxed px-4">
                                Requer cargo de <strong class="text-white">Playtester</strong> ou <strong class="text-white">Apoiador</strong>
                            </p>
                        </div>
                    </div>
                    <div class="absolute bottom-6 text-[8px] text-gray-700 font-mono tracking-widest">
                        SYSTEM VERSION 5.0 // AUTHORIZED PERSONNEL ONLY
                    </div>
                </div>
            `;
        }
