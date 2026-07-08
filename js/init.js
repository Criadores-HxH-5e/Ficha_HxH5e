function openHatsuDetail(idx) {
    state.hatsuDetailIdx = idx;
    state.view = 'HATSU_DETAIL';
    render();
}

function openHatsuEdit(idx) {
    const char = state.currentChar;
    const h = (char.hatsus||[])[idx];
    if (!h) return;
    // Pré-popula o builder com os dados do hatsu existente
    state.hatsuBuilder = {
        step: 0,
        nome: h.nome || '',
        descricao: h.descricao || '',
        tipo: h.tipo || '',
        tipoA: (h.tipo||'').split('+')[0] || '',
        tipoB: (h.tipo||'').split('+')[1] || '',
        openAccordions: ['leves','moderadas','pesadas','variaveis','extremas'],
        rg: (h.restricoes||[]).filter(id => id.startsWith('rg_')),
        rc: (h.restricoes||[]).filter(id => !id.startsWith('rg_')),
        eg: (h.efeitos||[]).filter(id => id.startsWith('eg')),
        ec: (h.efeitos||[]).filter(id => !id.startsWith('eg')),
        beneficioChoices: {...(h.beneficioChoices||{})},
        pureRestrictions: {...(h.pureRestrictions||{})},
        restrTab: 'gerais',
        specialChoices: {...(h.specialChoices||{})},
        juramentoImutavelNivelBase: h.juramentoImutavelNivelBase != null ? h.juramentoImutavelNivelBase : undefined,
        editingIdx: idx
    };
    state.view = 'HATSU_CREATOR';
    render();
}

//Criação de Nen
function openHatsuCreator() {
    state.view = 'HATSU_CREATOR';
    state.hatsuBuilder = { step:0, nome:'', descricao:'', tipoA:'', tipoB:'', rg:[], rc:[], eg:[], ec:[], openAccordions:['leves','moderadas','pesadas','variaveis','extremas'], restrTab:'gerais', beneficioChoices:{} };
    render();
}

function closeHatsuCreator() {
    state.view = 'SHEET'; // Volta para a ficha
    state.activeTab = 'NEN'; // Garante que volta na aba de Nen
    render();
}

        // ── Confirmação de delete de Hatsu por digitação do nome ──
        window.deleteHatsuConfirm = function(idx, afterDelete) {
            const char = state.currentChar;
            const h = (char.hatsus||[])[idx];
            if (!h) return;
            const nome = h.nome || 'este hatsu';

            // Cria overlay de confirmação
            const overlay = document.createElement('div');
            overlay.id = 'delete-hatsu-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px;font-family:Rajdhani,sans-serif';
            overlay.innerHTML = `
                <div style="background:#0d1117;border:2px solid #ef4444;border-radius:16px;padding:24px;width:100%;max-width:380px;box-shadow:0 0 40px #ef444433">
                    <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:#ef4444;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">⚠️ Deletar Hatsu</div>
                    <div style="font-size:12px;color:#9ca3af;margin-bottom:16px;line-height:1.5">
                        Esta ação é <span style="color:#ef4444;font-weight:700">irreversível</span>. Para confirmar, digite o nome do hatsu abaixo:
                    </div>
                    <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Nome do Hatsu</div>
                    <div style="background:#111827;border:1px solid #374151;border-radius:8px;padding:8px 12px;margin-bottom:6px;font-family:Orbitron,sans-serif;font-size:13px;color:#fbbf24;letter-spacing:1px">${nome}</div>
                    <input id="delete-confirm-input" type="text" placeholder="Digite o nome aqui..." autocomplete="off"
                        style="width:100%;box-sizing:border-box;background:#0a0a0f;border:2px solid #374151;border-radius:8px;padding:10px 12px;color:#fff;font-size:13px;font-family:Rajdhani,sans-serif;outline:none;margin-bottom:16px;transition:border-color .2s"
                        oninput="
                            const v = this.value;
                            const match = v.trim().toLowerCase() === '${nome.replace(/'/g, "\\'").toLowerCase()}';
                            this.style.borderColor = v.length === 0 ? '#374151' : match ? '#22c55e' : '#ef4444';
                            document.getElementById('delete-confirm-btn').disabled = !match;
                            document.getElementById('delete-confirm-btn').style.opacity = match ? '1' : '0.4';
                            document.getElementById('delete-confirm-btn').style.cursor = match ? 'pointer' : 'not-allowed';
                        "
                        onkeydown="if(event.key==='Escape') document.getElementById('delete-hatsu-overlay').remove();"
                    >
                    <div style="display:flex;gap:10px">
                        <button onclick="document.getElementById('delete-hatsu-overlay').remove()"
                            style="flex:1;padding:11px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">
                            Cancelar
                        </button>
                        <button id="delete-confirm-btn" disabled onclick="
                                document.getElementById('delete-hatsu-overlay').remove();
                                state.currentChar.hatsus.splice(${idx},1);
                                saveCharacter(state.currentChar);
                                ${afterDelete === 'sheet' ? "state.view='SHEET';state.activeTab='NEN';render();" : "render(true);"}
                            "
                            style="flex:1;padding:11px;border-radius:10px;background:#7f1d1d;border:1px solid #ef4444;color:#f87171;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:0.4;cursor:not-allowed">
                            🗑️ Deletar
                        </button>
                    </div>
                </div>`;

            document.body.appendChild(overlay);
            // Foca o input
            setTimeout(() => { const inp = document.getElementById('delete-confirm-input'); if(inp) inp.focus(); }, 50);
        };

        // ── Popup da Regra de Especialização para Manipulação/Materialização ──
        window._showEspRule = function() {
            const hb = state.hatsuBuilder;
            const espCheck = hb ? window.checkEspecializacaoAccess(hb) : { ok:false, specEfeitos:0, totalRestr:0, needed:3, counts:{leve:0,moderada:0,pesada:0,extrema:0}, pyramidOk:true };
            const { specEfeitos, totalRestr, needed, counts, pyramidOk, pyramidMsg } = espCheck;
            const espColor = '#a78bfa';

            const overlay = document.createElement('div');
            overlay.id = 'esp-rule-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif';
            overlay.innerHTML = `
                <div style="background:#0d1117;border:2px solid ${espColor};border-radius:20px;padding:24px;width:100%;max-width:380px;box-shadow:0 0 40px ${espColor}33;max-height:90vh;overflow-y:auto">
                    <div style="text-align:center;margin-bottom:16px">
                        <div style="font-size:20px;margin-bottom:4px">🌀</div>
                        <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:${espColor};text-transform:uppercase;letter-spacing:2px">Especialização — 1%</div>
                        <div style="font-size:10px;color:#6b7280;margin-top:4px">Regra especial para Manipuladores e Materializadores</div>
                    </div>

                    <!-- Regra -->
                    <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:12px;padding:14px;margin-bottom:16px;font-size:10px;color:#d1d5db;line-height:1.7">
                        <div style="font-size:8px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">📖‹ REGRA</div>
                        <p style="margin:0 0 8px">A quantidade de <b style="color:${espColor}">restrições totais</b> deve ser igual ou maior que <b style="color:${espColor}">3 + número de efeitos de Especialização</b> comprados.</p>
                        <p style="margin:0 0 8px">A distribuição inicia com <b>uma de cada peso</b> e uma de peso menor — <b style="color:#f87171">nunca pode ter maior quantidade</b> de um peso do que os de peso superior.</p>
                        <p style="margin:0">Com 1% de afinidade, <b style="color:#fbbf24">apenas efeitos até Nível 3</b> podem ser escolhidos.</p>
                    </div>

                    <!-- Tabela de exemplo -->
                    <div style="background:#0a0f1a;border:1px solid #1f2937;border-radius:12px;padding:12px;margin-bottom:16px">
                        <div style="font-size:8px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">📊 EXEMPLOS DE DISTRIBUIÇÃO</div>
                        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;font-size:9px;text-align:center">
                            <div style="font-weight:700;color:#9ca3af;padding:4px">Restrições</div>
                            <div style="font-weight:700;color:#9ca3af;padding:4px">Distribuição</div>
                            <div style="font-weight:700;color:${espColor};padding:4px">Efeitos Esp.</div>
                            ${[
                                ['4','1L + 1M + 2P','1'],
                                ['5','1L + 2M + 2P','2'],
                                ['5','1L + 1M + 3P','2'],
                                ['6','1L + 2M + 3P','3'],
                                ['6','2L + 2M + 2P','3'],
                            ].map(([r,d,e]) => `
                                <div style="padding:3px 0;color:#d1d5db;border-top:1px solid #1f2937">${r}</div>
                                <div style="padding:3px 0;color:#9ca3af;font-size:8px;border-top:1px solid #1f2937">${d}</div>
                                <div style="padding:3px 0;color:${espColor};font-weight:700;border-top:1px solid #1f2937">${e}</div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Status atual -->
                    <div style="background:#0a0f1a;border:1px solid ${espCheck.ok?'#4ade8055':'#f8717133'};border-radius:12px;padding:12px;margin-bottom:16px">
                        <div style="font-size:8px;font-weight:900;color:#6b7280;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">📖 SEU STATUS ATUAL</div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                            <span style="font-size:10px;color:#9ca3af">Efeitos de Especialização</span>
                            <span style="font-size:10px;font-weight:700;color:${espColor}">${specEfeitos}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                            <span style="font-size:10px;color:#9ca3af">Restrições necessárias</span>
                            <span style="font-size:10px;font-weight:700;color:${totalRestr>=needed?'#4ade80':'#f87171'}">${totalRestr} / ${needed}</span>
                        </div>
                        <div style="background:#1f2937;border-radius:99px;height:7px;overflow:hidden;margin-bottom:10px">
                            <div style="height:100%;width:${Math.min(100,Math.round(totalRestr/needed*100))}%;background:${totalRestr>=needed?'#4ade80':espColor};border-radius:99px;transition:width .3s"></div>
                        </div>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:${!pyramidOk?'8px':'0'}">
                            ${['leve','moderada','pesada','extrema'].map(p =>
                                `<span style="font-size:8px;padding:3px 8px;border-radius:6px;background:#1f2937;color:#9ca3af">${p[0].toUpperCase()+p.slice(1)}: <b style="color:#fff">${counts[p]||0}</b></span>`
                            ).join('')}
                        </div>
                        ${!pyramidOk ? `<div style="font-size:9px;color:#f87171;margin-top:6px;padding:6px 10px;background:#f8717111;border-radius:8px">⚠️ Pirâmide inválida: ${pyramidMsg}</div>` : ''}
                        ${espCheck.ok ? `<div style="font-size:9px;color:#4ade80;margin-top:6px;padding:6px 10px;background:#4ade8011;border-radius:8px;font-weight:700">✅ Condições satisfeitas! Especialização desbloqueada.</div>` : ''}
                    </div>

                    <button onclick="document.getElementById('esp-rule-overlay').remove()"
                        style="width:100%;padding:12px;border-radius:10px;background:${espColor};color:#000;font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;cursor:pointer;border:none;letter-spacing:1px">
                        Entendido
                    </button>
                </div>`;
            document.body.appendChild(overlay);
            overlay.addEventListener('click', e => { if(e.target === overlay) overlay.remove(); });
        };

        // ── Modal de Bônus de Talento — exibido após o primeiro Hatsu ──────────
        window._showTalentBonusModal = function(char, genTier, hatsuData) {
            const tierColors = {
                'Talentoso': '#60a5fa', 'Excelente': '#a78bfa',
                'Gênio': '#fbbf24', 'Ultimate': '#ff4df7'
            };
            const tc = tierColors[genTier] || '#60a5fa';

            const isTalentoso = genTier === 'Talentoso' || genTier === 'Excelente';
            const isUltimate  = genTier === 'Ultimate';

            const overlay = document.createElement('div');
            overlay.id = 'talent-bonus-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000dd;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif';

            // rev. Manual 2.0 — os +2 Graus do Talentoso somam ao que o Hatsu já tem na mesma
            // característica (restrições/efeitos + 5 Graus do 1º Hatsu). Não pode estourar o teto
            // combinado (calcMaxGrauPorCaracteristica: +5 nas peculiaridades da categoria).
            const classeParaCapTalento = (hatsuData && hatsuData.classe) || char.class || '';
            function _capInfoTalento(id) {
                if (!window.calcGrausPotenciaPorCaracteristica || !window.calcMaxGrauPorCaracteristica || !hatsuData) {
                    return { blocked: false, atual: 0, cap: Infinity };
                }
                const baseTotals = window.calcGrausPotenciaPorCaracteristica(hatsuData, char.level);
                const atual = (baseTotals[id] || 0) + 2;
                const cap = window.calcMaxGrauPorCaracteristica(char.level, classeParaCapTalento, id);
                return { blocked: cap !== Infinity && atual > cap, atual, cap };
            }

            // Graus options for Talentoso
            const grauOpts = isTalentoso ? [
                Object.assign({ id:'dano',    label:'+2 Graus de Dano', desc:'Aumenta o dado base de dano do hatsu em 2 passos' }, _capInfoTalento('dano')),
                Object.assign({ id:'alcance', label:'+2 Graus de Alcance', desc:'+3m de alcance por grau' }, _capInfoTalento('alcance')),
                Object.assign({ id:'area',    label:'+2 Graus de Área', desc:'+1,5m de área por grau' }, _capInfoTalento('area')),
                Object.assign({ id:'duracao', label:'+2 Graus de Duração', desc:'+1 rodada por grau' }, _capInfoTalento('duracao')),
                { id:'livre',   label:'Guardar como Graus Livres', desc:'Use quando quiser, em qualquer Hatsu futuro', blocked:false },
            ] : [];

            // Ultimate bonus options
            const ultOpts = isUltimate ? [
                { id:'pn_hatsu',  label:'+5 P.N neste Hatsu', desc:'Adiciona 5 pontos extras de NEN para este Hatsu agora' },
                { id:'graus_5',   label:'+5 Graus de Potência livres', desc:'Guarde e use quando quiser em qualquer Hatsu' },
            ] : [];

            const opts = isTalentoso ? grauOpts : isUltimate ? ultOpts : [];

            overlay.innerHTML = `
                <div style="background:#0d1117;border:2px solid ${tc};border-radius:20px;padding:24px;width:100%;max-width:380px;box-shadow:0 0 40px ${tc}44;max-height:90vh;overflow-y:auto">
                    <div style="text-align:center;margin-bottom:16px">
                        <div style="font-size:24px;margin-bottom:6px">${isUltimate?'👑':isTalentoso?'✨':'✨'}</div>
                        <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:${tc};text-transform:uppercase;letter-spacing:2px">${genTier} — Bônus de Talento</div>
                        <div style="font-size:10px;color:#9ca3af;margin-top:6px;line-height:1.5">
                            ${isTalentoso
                                ? 'Seu talento natural concede <b style="color:'+tc+'">+2 Graus de Potência</b> para o seu Primeiro Hatsu.<br>Escolha como deseja aplicá-los:'
                                : isUltimate
                                    ? 'Nível lendário. Além do XP dobrado, você recebe um bônus extra.<br>Escolha como aplicar:'
                                    : 'Seu XP já é multiplicado por 1,5× automaticamente em todas as situações.'}
                        </div>
                    </div>

                    ${opts.length > 0 ? `
                    <div id="talent-opts-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">
                        ${opts.map((o,i) => `
                        <div ${o.blocked ? '' : `onclick="window._selectTalentOpt('${o.id}',${i})"`}
                            id="talent-opt-${i}"
                            style="padding:12px 14px;border-radius:12px;border:2px solid #1f2937;background:#0a0f1a;cursor:${o.blocked?'not-allowed':'pointer'};transition:all .15s;opacity:${o.blocked?'0.45':'1'}">
                            <div style="font-size:11px;font-weight:700;color:#e5e7eb">${o.label}</div>
                            <div style="font-size:9px;color:#9ca3af;margin-top:3px">${o.desc}</div>
                            ${o.blocked ? `<div style="font-size:8px;color:#f87171;margin-top:4px;font-weight:700">⚠ Excede o limite de Grau de Potência (${o.atual}/${o.cap})</div>` : ''}
                        </div>`).join('')}
                    </div>
                    <button id="talent-confirm-btn" disabled onclick="window._confirmTalentBonus()"
                        style="width:100%;padding:13px;border-radius:10px;background:#374151;border:none;color:#6b7280;font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;cursor:not-allowed;letter-spacing:1px;transition:all .2s">
                        Confirmar
                    </button>` : `
                    <button onclick="document.getElementById('talent-bonus-overlay').remove()"
                        style="width:100%;padding:13px;border-radius:10px;background:${tc};color:#000;border:none;font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">
                        Entendido ✓
                    </button>`}
                </div>`;

            document.body.appendChild(overlay);

            overlay._selectedOpt = null;
            overlay._opts = opts;
            overlay._tc = tc;
            overlay._hatsuData = hatsuData;
            overlay._char = char;
        };

        window._selectTalentOpt = function(id, idx) {
            const overlay = document.getElementById('talent-bonus-overlay');
            if (!overlay) return;
            overlay._selectedOpt = id;
            const tc = overlay._tc;
            overlay._opts.forEach((o, i) => {
                const el = document.getElementById('talent-opt-' + i);
                if (!el) return;
                el.style.borderColor = i === idx ? tc : '#1f2937';
                el.style.background = i === idx ? tc + '18' : '#0a0f1a';
                el.querySelector('div').style.color = i === idx ? tc : '#e5e7eb';
            });
            const btn = document.getElementById('talent-confirm-btn');
            if (btn) {
                btn.disabled = false;
                btn.style.background = tc;
                btn.style.color = '#000';
                btn.style.cursor = 'pointer';
                btn.style.boxShadow = '0 0 16px ' + tc + '55';
            }
        };

        window._confirmTalentBonus = function() {
            const overlay = document.getElementById('talent-bonus-overlay');
            if (!overlay) return;
            const opt = overlay._selectedOpt;
            const char = overlay._char;
            const hatsuData = overlay._hatsuData;
            if (!opt) return;

            if (!char.talentBonus) char.talentBonus = {};

            if (opt === 'pn_hatsu') {
                // Adds 5 extra PN to this hatsu — stored on char as bonus pool used in hatsu detail
                char.talentBonus.pnExtra = 5;
                char.talentBonus.applied = 'pn_hatsu';
                // Mark on the hatsu itself
                const hIdx = char.hatsus.findIndex(h => h.id === hatsuData.id);
                if (hIdx >= 0) char.hatsus[hIdx].bonusPNExtra = 5;
            } else if (opt === 'graus_5') {
                char.talentBonus.grausLivres = (char.talentBonus.grausLivres || 0) + 5;
                char.talentBonus.applied = 'graus_5';
            } else if (opt === 'livre') {
                char.talentBonus.grausLivres = (char.talentBonus.grausLivres || 0) + 2;
                char.talentBonus.applied = 'graus_livres';
            } else {
                // Apply to this hatsu's damage table directly — revalida o teto de Grau de Potência
                // (mesma regra do modal dos 5 Graus do 1º Hatsu) antes de gravar, por segurança.
                const hIdx = char.hatsus.findIndex(h => h.id === hatsuData.id);
                const targetH = hIdx >= 0 ? char.hatsus[hIdx] : hatsuData;
                if (window.calcGrausPotenciaPorCaracteristica && window.calcMaxGrauPorCaracteristica) {
                    const classe = targetH.classe || char.class;
                    const baseTotals = window.calcGrausPotenciaPorCaracteristica(Object.assign({}, targetH, { bonusGraus: null }), char.level);
                    const atual = (baseTotals[opt] || 0) + 2;
                    const cap = window.calcMaxGrauPorCaracteristica(char.level, classe, opt);
                    if (cap !== Infinity && atual > cap) {
                        if (window._hShowGrauLimiteToast) {
                            const LABELS = { dano:'🔥 Dano/Cura', alcance:'📏 Alcance', area:'🔵 Área', duracao:'⏱️ Duração', acerto:'⚔️ Acerto', cd:'🎯 CD do TR' };
                            window._hShowGrauLimiteToast(LABELS[opt] || opt, atual, cap, char.level || 1);
                        }
                        return;
                    }
                }
                char.talentBonus.applied = opt;
                char.talentBonus.grausHatsu = { tipo: opt, valor: 2, hatsuId: hatsuData.id };
                if (hIdx >= 0) char.hatsus[hIdx].bonusGraus = { tipo: opt, valor: 2 };
            }

            saveCharacter(char);
            overlay.remove();
            render(true);
        };

        // ── Modal de distribuição dos 5 Graus do Primeiro Hatsu ───────────────
        window._showPrimeiroHatsuModal = function(char, hatsuIdx, hatsuData, genTier) {
            const h = char.hatsus[hatsuIdx];
            const hatsuClasse = (h && h.classe) || char.class || '';
            const catDB = (window.HATSU_DB && window.HATSU_DB.categorias[hatsuClasse]) || {};
            const tc = catDB.cor || '#00ff88';
            const TOTAL = 5;

            const GRAUS_POR_CAT = {
                'INTENSIFICAÇÃO': ['acerto', 'atributos', 'dano', 'custo'],
                'TRANSMUTAÇÃO':   ['area', 'dano', 'custo'],
                'MATERIALIZAÇÃO': ['alcance', 'area', 'duracao', 'custo'],
                'CONJURAÇÃO':     ['alcance', 'area', 'duracao', 'custo'],
                'ESPECIALIZAÇÃO': ['alcance', 'area', 'dano', 'duracao', 'cd', 'custo'],
                'MANIPULAÇÃO':    ['alcance', 'area', 'alvos', 'duracao', 'cd', 'custo'],
                'EMISSÃO':        ['acerto', 'alcance', 'area', 'custo'],
            };
           const GRAU_INFO = {
    acerto:    { label: '⚔️ Acerto',           desc: '+1 na jogada de ataque' },
    atributos: { label: '💪 Atributos',        desc: '+1 em atributo ou perícia' },
    dano:      { label: '🔥 Dano',             desc: '+1 passo na tabela de dano' },
    alcance:   { label: '📏 Alcance',          desc: '+3m de alcance' },
    area:      { label: '🔵 Área',             desc: '+1,5m de raio/área' },
    duracao:   { label: '⏱️ Duração',          desc: '+1 rodada de duração' },
    cd:        { label: '🎯 CD do TR',          desc: '+1 na CD do Teste de Resistência' },
    alvos:     { label: '👥 Nº de Alvos',       desc: '+1 alvo adicional' },
    custo:     { label: '💨 Redução de Custo',  desc: '-5% do custo de aura' },
};

            const available = GRAUS_POR_CAT[hatsuClasse] || ['dano', 'custo'];
            const existing = h.primeiroHatsuGraus || {};
            const alloc = {};
            available.forEach(k => alloc[k] = existing[k] || 0);

            // rev. Manual 2.0 — os pontos deste modal SOMAM ao Grau de Potência que restrições/efeitos
            // já deram à mesma característica (ex: Distância Segura, Interação Sensorial Simples).
            // O teto por característica (calcMaxGrauPorCaracteristica: +5 nas peculiaridades da
            // categoria, mesmo em nível 1-2) é sobre o TOTAL combinado, não sobre este pool isolado.
            const TRACKED_KEYS = ['dano', 'alcance', 'area', 'duracao', 'acerto', 'cd'];
            const baseShim = Object.assign({}, h, { primeiroHatsuGraus: null });
            const baseTotals = window.calcGrausPotenciaPorCaracteristica ? window.calcGrausPotenciaPorCaracteristica(baseShim, char.level) : {};
            const grauMaxByKey = {};
            TRACKED_KEYS.forEach(k => {
                grauMaxByKey[k] = window.calcMaxGrauPorCaracteristica ? window.calcMaxGrauPorCaracteristica(char.level, hatsuClasse, k) : Infinity;
            });

            const overlay = document.createElement('div');
            overlay.id = 'primeiro-hatsu-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000dd;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif';

            function rebuild() {
                const total = Object.values(alloc).reduce((s,v) => s+v, 0);
                const remaining = TOTAL - total;
                const done = total === TOTAL;
                const rowsHtml = available.map(k => {
                    const info = GRAU_INFO[k] || { label: k, desc: '' };
                    const val = alloc[k] || 0;
                    const isTracked = TRACKED_KEYS.includes(k);
                    const base = isTracked ? (baseTotals[k] || 0) : 0;
                    const capK = isTracked ? grauMaxByKey[k] : Infinity;
                    const roomLeft = capK === Infinity ? Infinity : capK - base - val;
                    const canAdd = remaining > 0 && (roomLeft === Infinity || roomLeft > 0);
                    const capNote = (isTracked && capK !== Infinity && base > 0)
                        ? `<div style="font-size:7px;color:${roomLeft<=0?'#f87171':'#6b7280'};margin-top:2px">Já possui +${base} nesta característica (máx. total: ${capK})</div>`
                        : '';
                    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#0a0f1a;border-radius:10px;border:1px solid ${val>0?tc+'44':'#1f2937'}">
                        <div>
                            <div style="font-size:11px;font-weight:700;color:${val>0?tc:'#d1d5db'}">${info.label}</div>
                            <div style="font-size:8px;color:#6b7280">${info.desc}</div>
                            ${capNote}
                        </div>
                        <div style="display:flex;align-items:center;gap:8px">
                            <button onclick="window._phGrauDecr('${k}')"
                                style="width:28px;height:28px;border-radius:7px;background:${val>0?tc+'22':'#1f2937'};border:1px solid ${val>0?tc+'44':'#374151'};color:${val>0?tc:'#4b5563'};font-size:16px;font-weight:900;cursor:${val>0?'pointer':'default'};line-height:1">−</button>
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;color:${val>0?tc:'#4b5563'};min-width:18px;text-align:center">${val}</span>
                            <button onclick="window._phGrauIncr('${k}')"
                                style="width:28px;height:28px;border-radius:7px;background:${canAdd?tc+'22':'#1f2937'};border:1px solid ${canAdd?tc+'44':'#374151'};color:${canAdd?tc:'#4b5563'};font-size:16px;font-weight:900;cursor:${canAdd?'pointer':'default'};line-height:1">+</button>
                        </div>
                    </div>`;
                }).join('');
                overlay.innerHTML = `
                <div style="background:#0d1117;border:2px solid ${tc};border-radius:20px;padding:24px;width:100%;max-width:380px;box-shadow:0 0 40px ${tc}44;max-height:90vh;overflow-y:auto">
                    <div style="text-align:center;margin-bottom:16px">
                        <div style="font-size:24px;margin-bottom:6px">⭐</div>
                        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:${tc};text-transform:uppercase;letter-spacing:2px">5 Graus do 1Âº Hatsu</div>
                        <div style="font-size:9px;color:#9ca3af;margin-top:6px;line-height:1.5">
                            Distribua <b style="color:${tc}">5 Graus de Potência</b> entre as características permitidas pela categoria <b style="color:${tc}">${hatsuClasse}</b>.
                        </div>
                        <div style="margin-top:10px;display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:20px;background:${done?tc+'22':'#1f2937'};border:1px solid ${done?tc+'55':'#374151'}">
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:18px;color:${done?tc:'#9ca3af'}">${total}/5</span>
                            <span style="font-size:9px;color:#6b7280">${remaining>0?remaining+' restante'+(remaining>1?'s':''):'Completo ✓'}</span>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">${rowsHtml}</div>
                    <button onclick="window._confirmPrimeiroHatsu()" ${done?'':'disabled'}
                        style="width:100%;padding:13px;border-radius:10px;background:${done?tc:'#374151'};border:none;color:${done?'#000':'#6b7280'};font-family:'Orbitron',sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;cursor:${done?'pointer':'not-allowed'};letter-spacing:1px;box-shadow:${done?'0 0 16px '+tc+'55':'none'};transition:all .2s">
                        Confirmar
                    </button>
                </div>`;
            }

            window._phGrauIncr = function(k) {
                const total = Object.values(alloc).reduce((s,v) => s+v, 0);
                if (total >= TOTAL) return;
                if (TRACKED_KEYS.includes(k)) {
                    const capK = grauMaxByKey[k];
                    const base = baseTotals[k] || 0;
                    if (capK !== Infinity && base + (alloc[k]||0) + 1 > capK) {
                        if (window._hShowGrauLimiteToast) {
                            const LABELS = { dano:'🔥 Dano/Cura', alcance:'📏 Alcance', area:'🔵 Área', duracao:'⏱️ Duração', acerto:'⚔️ Acerto', cd:'🎯 CD do TR' };
                            window._hShowGrauLimiteToast(LABELS[k] || k, base + (alloc[k]||0) + 1, capK, char.level || 1);
                        }
                        return;
                    }
                }
                alloc[k] = (alloc[k]||0) + 1;
                rebuild();
            };
            window._phGrauDecr = function(k) {
                if ((alloc[k]||0) <= 0) return;
                alloc[k]--;
                rebuild();
            };
            window._confirmPrimeiroHatsu = function() {
                const total = Object.values(alloc).reduce((s,v) => s+v, 0);
                if (total !== TOTAL) return;
                char.hatsus[hatsuIdx].primeiroHatsuGraus = Object.assign({}, alloc);
                saveCharacter(char);
                overlay.remove();
                render(true);
                if (genTier && ['Talentoso','Excelente','Gênio','Ultimate'].includes(genTier)) {
                    window._showTalentBonusModal(char, genTier, hatsuData);
                }
            };

            document.body.appendChild(overlay);
            rebuild();
        };

        window._openPrimeiroHatsuModal = function() {
            const char = state.currentChar;
            const idx = state.hatsuDetailIdx || 0;
            const h = char.hatsus[idx];
            if (!h) return;
            window._showPrimeiroHatsuModal(char, idx, h, char.genialidade);
        };

        window._showSanityModal = function(char, threshold, currentPct) {
            const CURTA = [
                [1,20,'Paralisia mental — paralisado. Termina ao sofrer qualquer dano.'],
                [21,30,'Vontade avassaladora de comer coisas estranhas (terra, limo, restos). Envenenado.'],
                [31,40,'Amedrontado — usa ação a cada rodada para fugir da fonte do medo.'],
                [41,50,'Balbucia — incapaz de falar ou usar Hatsu com restrições verbais.'],
                [51,60,'Usa ação a cada rodada para atacar a criatura mais próxima à frente ou direita.'],
                [61,70,'Atordoado por 5 turnos, ignora a rolagem inicial de tempo.'],
                [71,75,'Obedece qualquer ordem que não seja obviamente suicida.'],
                [76,80,'Alucinações vívidas — desvantagem em testes de habilidade.'],
                [81,90,'Incapacitado — passa o tempo gritando, rindo ou chorando.'],
                [91,100,'Cai inconsciente.'],
            ];
            const LONGA = [
                [1,10,'Compulsão repetitiva (lavar mãos, tocar objetos, rezar). Não fazê-la a cada 3 rodadas: −1 Sanidade/3 rodadas.'],
                [11,20,'Perde a capacidade de falar. Hatsus verbais afetados.'],
                [21,30,'Alucinação vívida — desvantagem em testes de habilidade.'],
                [31,40,'Alucinação poderosa — vê-se sofrendo ou apaixonado por algo no contexto da cena.'],
                [41,50,'Ligado a um "talismã da sorte". Desvantagem em ataques, testes e TRs a mais de 9m dele.'],
                [51,60,'Tremores e tiques incontroláveis — desvantagem em jogadas de Força ou Destreza.'],
                [61,70,'Amnésia parcial — não reconhece pessoas nem lembra de eventos anteriores à loucura.'],
                [71,80,'Sem ação própria, totalmente sugestionável.'],
                [81,90,'Ao sofrer dano: TR de Sabedoria CD 15 ou o dano conta para redução de Sanidade.'],
                [91,100,'Cai inconsciente — nenhum empurrão ou dano o acorda.'],
            ];
            const PERM_LEVE = ['Avareza','Covardia','Cleptomania','Desvio de Atenção','Dupla Personalidade','Impulsividade','Instinto Assassino','Megalomania','Mente de Criança','Paranoia','Pesadelos','Visões de Morte'];
            const PERM_PESADA = [
                [1,10,'Medo incontrolável e paralisia.'],
                [11,20,'Não reconhece aliados (todos são inimigos) OU reconhece inimigo como melhor amigo.'],
                [21,30,'Atitude homicida — tenta matar um aliado que vê como causa do sofrimento.'],
                [31,40,'Arranca os cabelos gritando com horror (Fascinado).'],
                [41,50,'Machuca os olhos tentando arrancá-los (Golpe mirado).'],
                [51,60,'Tenta estrangular um aliado.'],
                [61,70,'Tenta estrangular a si mesmo.'],
                [71,80,'Esquece a própria identidade — perde o Hatsu até retomar a memória.'],
                [81,90,'Atitude suicida — tenta se matar ou se jogar no perigo que causou a insanidade.'],
                [91,100,'Cai no chão e assume posição fetal, ignora tudo. (Incapacitado)'],
            ];

            const configs = {
                90: { cat:'CURTA DURAÇÃO', dado:'1d100', cor:'#fbbf24', durRoll: () => Math.ceil(Math.random()*6), durLabel: v => v+' rodada'+(v!==1?'s':''), table: CURTA, roll: () => Math.ceil(Math.random()*100) },
                75: { cat:'LONGA DURAÇÃO', dado:'1d100', cor:'#f87171', durRoll: () => Math.ceil(Math.random()*10), durLabel: v => v+' hora'+(v!==1?'s':''), table: LONGA, roll: () => Math.ceil(Math.random()*100) },
                50: { cat:'PERMANENTE LEVE', dado:'1d12', cor:'#a78bfa', durRoll: () => null, durLabel: () => 'Permanente', table: PERM_LEVE, roll: () => Math.ceil(Math.random()*12) },
                25: { cat:'PERMANENTE PESADO', dado:'1d100', cor:'#ff4df7', durRoll: () => null, durLabel: () => 'Permanente', table: PERM_PESADA, roll: () => Math.ceil(Math.random()*100) },
            };

            const cfg = configs[threshold];
            const roll = cfg.roll();
            const durVal = cfg.durRoll();
            const duracao = cfg.durLabel(durVal);

            let resultado = '';
            if (threshold === 50) {
                resultado = PERM_LEVE[roll - 1] || PERM_LEVE[0];
            } else {
                const entry = cfg.table.find(e => roll >= e[0] && roll <= e[1]);
                resultado = entry ? entry[2] : '—';
            }

            const rdm = calcRDM(char);

            // Save condition to character
            if (!char.conditions) char.conditions = [];
            char.conditions.push({
                categoria: cfg.cat,
                condicao: resultado,
                roll: `${roll} (${cfg.dado})`,
                duracao: duracao,
                sanPct: currentPct,
                data: new Date().toLocaleDateString('pt-BR'),
                resolved: false,
            });
            saveCharacter(char);

            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000ee;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif';
            overlay.innerHTML = `
                <div style="background:#0d1117;border:2px solid ${cfg.cor};border-radius:20px;padding:24px;width:100%;max-width:400px;max-height:90vh;overflow-y:auto;box-shadow:0 0 40px ${cfg.cor}44">
                    <div style="text-align:center;margin-bottom:16px">
                        <div style="font-size:22px;margin-bottom:6px">🧠</div>
                        <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:${cfg.cor};text-transform:uppercase;letter-spacing:2px">SURTO DE LOUCURA</div>
                        <div style="font-size:11px;font-weight:900;color:${cfg.cor};margin-top:4px">${cfg.cat}</div>
                        <div style="font-size:9px;color:#6b7280;margin-top:3px">${char.name} atingiu ${currentPct}% de Sanidade</div>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
                        <div style="background:#060d1a;border:1px solid ${cfg.cor}44;border-radius:12px;padding:12px;text-align:center">
                            <div style="font-size:9px;color:#6b7280;text-transform:uppercase;font-weight:700;margin-bottom:6px">Rolagem ${cfg.dado}</div>
                            <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:32px;color:${cfg.cor};text-shadow:0 0 16px ${cfg.cor}">${roll}</div>
                        </div>
                        <div style="background:#060d1a;border:1px solid ${cfg.cor}44;border-radius:12px;padding:12px;text-align:center">
                            <div style="font-size:9px;color:#6b7280;text-transform:uppercase;font-weight:700;margin-bottom:6px">Duração</div>
                            <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:22px;color:${cfg.cor};line-height:1.2">${duracao}</div>
                        </div>
                    </div>

                    <div style="background:#0a0f1a;border:1px solid ${cfg.cor}55;border-radius:12px;padding:14px;margin-bottom:14px">
                        <div style="font-size:8px;font-weight:900;color:${cfg.cor};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">⚡ CONDIÇÃO</div>
                        <div style="font-size:12px;color:#e5e7eb;line-height:1.6;font-weight:600">${resultado}</div>
                    </div>

                    ${rdm > 0 ? `<div style="background:#1f293744;border:1px solid #374151;border-radius:10px;padding:10px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">
                        <span style="font-size:9px;color:#9ca3af;font-weight:700">🛡️ RDM (Redução Dano Mental)</span>
                        <span style="font-family:Orbitron,sans-serif;font-weight:900;font-size:14px;color:#60a5fa">−${rdm}</span>
                    </div>` : ''}

                    <div style="font-size:8px;color:#6b7280;text-align:center;margin-bottom:12px">Condição registrada na aba <b style="color:${cfg.cor}">COND</b></div>

                    <button onclick="this.closest('div[style*=fixed]').remove();state.activeTab='COND';render(true)"
                        style="width:100%;padding:13px;border-radius:10px;background:${cfg.cor};color:#000;border:none;font-family:Orbitron,sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">
                        Ver na Aba COND →
                    </button>
                </div>`;
            document.body.appendChild(overlay);
        };

        window._showSanDamageModal = function() {
            const char = state.currentChar;
            const rdm = calcRDM(char);
            const sanAtual = char.vitals.san || 100;

            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px;font-family:Rajdhani,sans-serif';
            overlay.innerHTML =
                '<div style="background:#0d1117;border:2px solid #a78bfa;border-radius:18px;padding:22px;width:100%;max-width:340px;box-shadow:0 0 40px #a78bfa33">'
                + '<div style="text-align:center;margin-bottom:16px">'
                +   '<div style="font-size:20px;margin-bottom:4px">🧠 </div>'
                +   '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:12px;color:#a78bfa;text-transform:uppercase;letter-spacing:2px">Dano de Sanidade</div>'
                +   '<div style="font-size:9px;color:#6b7280;margin-top:3px">Sanidade atual: <b style="color:#fff">' + sanAtual + '</b> / 100</div>'
                + '</div>'
                + (rdm > 0
                    ? '<div style="background:#1f293755;border:1px solid #60a5fa44;border-radius:10px;padding:10px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center">'
                    +   '<span style="font-size:9px;color:#60a5fa;font-weight:700">🛡️ RDM ativo — será subtraído</span>'
                    +   '<span style="font-family:Orbitron,sans-serif;font-weight:900;font-size:14px;color:#60a5fa">−' + rdm + '</span>'
                    + '</div>'
                    : '')
                + '<div style="margin-bottom:14px">'
                +   '<label style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px">Quantidade de dano recebido:</label>'
                +   '<input id="san-dmg-input" type="number" min="1" placeholder="Ex: 15"'
                +     ' oninput="window._sanDmgUpdate(this.value)"'
                +     ' style="width:100%;box-sizing:border-box;background:#060d1a;border:2px solid #374151;border-radius:10px;padding:12px 14px;color:#fff;font-family:Orbitron,sans-serif;font-weight:900;font-size:22px;outline:none;text-align:center;transition:border-color .15s">'
                +   '<div id="san-dmg-preview" style="text-align:center;margin-top:8px;font-size:10px;color:#6b7280;min-height:18px"></div>'
                + '</div>'
                + '<div style="display:flex;gap:8px">'
                +   '<button onclick="document.getElementById(\'san-dmg-input\').closest(\'div[style*=fixed]\').remove()"'
                +     ' style="flex:1;padding:12px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Cancelar</button>'
                +   '<button id="san-dmg-confirm" onclick="window._confirmSanDmg()" disabled'
                +     ' style="flex:2;padding:12px;border-radius:10px;background:#374151;border:none;color:#6b7280;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:not-allowed;transition:all .2s">Aplicar Dano</button>'
                + '</div>'
                + '</div>';
            document.body.appendChild(overlay);
            setTimeout(() => { const inp = document.getElementById('san-dmg-input'); if (inp) inp.focus(); }, 50);
        };

        window._sanDmgUpdate = function(val) {
            const char = state.currentChar;
            const rdm = calcRDM(char);
            const raw = parseInt(val) || 0;
            const effective = Math.max(0, raw - rdm);
            const preview = document.getElementById('san-dmg-preview');
            const btn = document.getElementById('san-dmg-confirm');
            const input = document.getElementById('san-dmg-input');
            if (raw > 0) {
                if (rdm > 0) {
                    preview.innerHTML = '<span style="color:#f87171;font-weight:700">' + raw + '</span>'
                        + ' <span style="color:#6b7280">− ' + rdm + ' RDM =</span>'
                        + ' <span style="color:#a78bfa;font-weight:900;font-size:13px"> −' + effective + ' Sanidade</span>';
                } else {
                    preview.innerHTML = '<span style="color:#a78bfa;font-weight:900;font-size:13px">−' + effective + ' Sanidade</span>';
                }
                if (input) input.style.borderColor = '#a78bfa';
                if (btn) { btn.disabled = false; btn.style.background = '#a78bfa'; btn.style.color = '#000'; btn.style.cursor = 'pointer'; }
            } else {
                if (preview) preview.innerHTML = '';
                if (input) input.style.borderColor = '#374151';
                if (btn) { btn.disabled = true; btn.style.background = '#374151'; btn.style.color = '#6b7280'; btn.style.cursor = 'not-allowed'; }
            }
        };

        window._confirmSanDmg = function() {
            const char = state.currentChar;
            const rdm = calcRDM(char);
            const raw = parseInt(document.getElementById('san-dmg-input')?.value) || 0;
            if (raw <= 0) return;
            const effective = Math.max(0, raw - rdm);
            document.getElementById('san-dmg-input')?.closest('div[style*=fixed]')?.remove();
            if (effective > 0) updateVital('san', -effective);
            else { saveCharacter(char); render(true); }
        };

        window._activatePrincipio = function(key, custo) {
            const char = state.currentChar;
            const d = char.nenDominio || {};
            const aura = char.vitals.aura || 0;
            if (custo > 0 && aura < custo) {
                alert('Aura insuficiente! Necessário: ' + custo + '% — disponível: ' + aura + '%');
                return;
            }

            // Deduct aura
            if (custo > 0) {
                char.vitals.aura = Math.max(0, aura - custo);
            }

            // Effect messages per principle
            const nivel = d[key] || 1;
           const EFEITOS = {
    ten:   ['🛡️ TEN ativado — +2 RD (Corte, Impacto, Explosão) por esta reação.',
            '🛡️ TEN ativado — +4 RD. Imune a projéteis que igualem CA.',
            '🛡️ TEN ativado — +6 RD. Máxima proteção.'],
    ren:   ['💪 REN ativado — próximo ataque no turno: +1 Grau de dano.',
            '💪 REN ativado — +1 Grau de dano e +3 em Intimidação/Arcanismo com REN.',
            '💪 REN ativado — Intermediário + pode usar 1×/dia sem custo de aura.'],
    zetsu: ['👁️ ZETSU ativado — aguarde 3 rodadas: +5% Aura, +1 Reação, +3 Furtividade.',
            '👁️ ZETSU ativado — aguarde 2 rodadas: +10% Aura, +1 Reação, +3 Furtividade.',
            '👁️ ZETSU ativado — aguarde 1 rodada: +10% Aura, +2 Reações, +6 Furtividade.'],
    en:    ['🔵 EN ativado — detecta forma e movimento em 3m por 1 rodada. Ataque de reação vs quem entrar.'],
    inp:   ['🌑 IN ativado — objeto de aura oculto até próximo turno.'],
    gyo:   ['👁️ GYO ativado — visão de aura e objetos ocultos (ou +3 FOR/DES/CON por 1 rodada se corporal).'],
    shu:   ['⚡ SHU ativado — objeto envolto: +1d4 Dano e CA por 1 rodada. Golpe mirado sem ônus.'],
    ken:   ['🏯 KEN ativado — CA dobrada por 2 rodadas. Consome 4 Reações.'],
    ko:    ['🔥 KO ativado — próximo golpe: dano ×3. ATENÇÃO: CA reduzida em 80% até próximo turno!'],
    ryu:   ['🌊 RYU ativado — +3 CA e Ataque por 3 turnos. Múltiplos contra-ataques permitidos.'],
};
            const msgs = EFEITOS[key];
            const msg = msgs ? (msgs[nivel-1] || msgs[msgs.length-1]) : 'Princípio ativado.';

            saveCharacter(char);
            render(true);

            // Show effect toast
            const toast = document.createElement('div');
            toast.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#0d1117;border:2px solid #a78bfa;border-radius:14px;padding:14px 20px;z-index:9999;font-family:Rajdhani,sans-serif;max-width:320px;text-align:center;box-shadow:0 0 30px #a78bfa44;animation:fadeIn .2s';
            toast.innerHTML = '<div style="font-size:12px;color:#e5e7eb;font-weight:700;line-height:1.5">' + msg + '</div>'
                + (custo > 0 ? '<div style="font-size:9px;color:#6b7280;margin-top:4px">−' + custo + '% Aura</div>' : '');
            document.body.appendChild(toast);
            setTimeout(() => { toast.style.opacity='0'; toast.style.transition='opacity .4s'; setTimeout(()=>toast.remove(),400); }, 3000);
        };

        window._manualSync = async function() {
            if (!state.user) return;
            const badge = document.getElementById('sync-status-badge');
            if (badge) { badge.textContent = '⟳ Sincronizando...'; badge.style.background = '#fbbf2422'; badge.style.color = '#fbbf24'; }

            await syncFromCloud();
            loadCharacters();
            render(true);
            if (badge) { badge.textContent = '✓ Sincronizado'; badge.style.background = '#4ade8022'; badge.style.color = '#4ade80'; }
        };

        window._resolveCondition = function(idx) {
            const char = state.currentChar;
            if (!char.conditions || !char.conditions[idx]) return;
            char.conditions[idx].resolved = true;
            saveCharacter(char);
            render(true);
        };

        window._clearResolvedConditions = function() {
            const char = state.currentChar;
            if (!char.conditions) return;
            char.conditions = char.conditions.filter(c => !c.resolved);
            saveCharacter(char);
            render(true);
        };

        window._toggleNavMenu = function(e) {
            e.stopPropagation();
            const menu = document.getElementById('nav-dropdown');
            if (!menu) return;
            const isOpen = menu.style.display !== 'none';
            menu.style.display = isOpen ? 'none' : 'block';
            const btn = document.getElementById('nav-hamburger');
            if (btn) btn.style.borderColor = isOpen ? '#1f2937' : '#374151';
        };
        document.addEventListener('click', function() {
            const menu = document.getElementById('nav-dropdown');
            if (menu) menu.style.display = 'none';
            const btn = document.getElementById('nav-hamburger');
            if (btn) btn.style.borderColor = '#1f2937';
        });

        window.addEventListener('DOMContentLoaded', () => { initWebhooks(); loadCharacters(); setThemeColor('#00ff9d'); checkDiscordAuth(); });

        void 0; // NPC generation removed
