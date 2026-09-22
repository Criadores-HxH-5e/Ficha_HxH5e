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
        efeitoNiveis: JSON.parse(JSON.stringify(h.efeitoNiveis||{})),
        juramentoImutavelNivelBase: h.juramentoImutavelNivelBase != null ? h.juramentoImutavelNivelBase : undefined,
        // Campos das tags P/M/E/B. Sem eles a edição APAGAVA a tag e todo o conteúdo de
        // Maldição, Exorcismo e Besta: ao salvar, tag voltava para 'P' e os dados sumiam.
        tag: h.tag || 'P',
        em: [].concat(h.efeitosMaldicao || []),
        temporizador: h.temporizador || '',
        maldicaoPositiva: !!h.maldicaoPositiva,
        reqMaldicao: {...(h.reqMaldicao || {})},
        ex: [].concat(h.efeitosExorcismo || []),
        be: [].concat(h.efeitosBesta || []),
        bestaCategoria: h.bestaCategoria || '',
        bestaManifestacao: h.bestaManifestacao || '',
        bestaLendario: h.bestaLendario || '',
        editingIdx: idx
    };
    state.view = 'HATSU_CREATOR';
    render();
}

//Criação de Nen
function openHatsuCreator() {
    state.view = 'HATSU_CREATOR';
    state.hatsuBuilder = { step:0, nome:'', descricao:'', tipoA:'', tipoB:'', rg:[], rc:[], eg:[], ec:[], openAccordions:['leves','moderadas','pesadas','variaveis','extremas'], restrTab:'gerais', beneficioChoices:{}, efeitoNiveis:{} };
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
                // Acerto saiu de Reforço/Intensificação: era duplicado, porque Atributos já
                // melhora a jogada de ataque (e as perícias). Mesma decisão de
                // GRAU_OPCOES_POR_CATEGORIA em hatsu-detail.js.
                'INTENSIFICAÇÃO': ['atributos', 'dano', 'custo'],
                'REFORÇO':        ['atributos', 'dano', 'custo'],
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
    alcance:   { label: '📏 Alcance',          desc: '+1,5m de alcance' },
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

            // Quando o grau vai para "Atributos", o jogador precisa dizer QUAL atributo —
            // mesma lógica do efeito Aumento de Atributo (ri_e1). Sem escolha, a tela avisa.
            const _PH_ATTRS = ['FOR','DES','CON','INT','SAB','PRE'];
            function _phAttrPickerHtml() {
                const escolhido = alloc._atributosAttr || '';
                return '<div style="margin-top:6px">'
                    + '<div style="font-size:7px;color:#6b7280;margin-bottom:3px">Em qual atributo?</div>'
                    + '<div style="display:flex;gap:3px;flex-wrap:wrap">'
                    + _PH_ATTRS.map(function (a) {
                        const active = escolhido === a;
                        return '<button onclick="event.stopPropagation();window._phSetAttr(\'' + a + '\')" '
                            + 'style="padding:4px 7px;border-radius:6px;font-size:8px;font-weight:900;cursor:pointer;border:1px solid '
                            + (active ? tc : '#374151') + ';background:' + (active ? tc + '22' : 'transparent')
                            + ';color:' + (active ? tc : '#9ca3af') + '">' + a + '</button>';
                    }).join('')
                    + '</div>'
                    + (escolhido ? '' : '<div style="font-size:7px;color:#f87171;margin-top:3px">⚠ Escolha o atributo.</div>')
                    + '</div>';
            }
            window._phSetAttr = function (a) { alloc._atributosAttr = a; rebuild(); };

            function rebuild() {
                // Soma só as características; _atributosAttr guarda texto, não grau.
                const total = ['acerto','atributos','dano','alcance','area','duracao','cd','alvos','custo']
                    .reduce(function (s, k) { return s + (alloc[k] || 0); }, 0);
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
                    // Radar de teto em TODAS as características, não só nas que já têm base.
                    // Antes só aparecia com base > 0, então Acerto e Atributos ficavam sem aviso.
                    let capNote = '';
                    if (!isTracked) {
                        capNote = `<div style="font-size:7px;color:#4b5563;margin-top:2px">Sem teto de Grau de Potência</div>`;
                    } else if (capK === Infinity) {
                        capNote = `<div style="font-size:7px;color:#4ade80;margin-top:2px">Nível 11+ — sem limite de teto</div>`;
                    } else {
                        const cor = roomLeft <= 0 ? '#f87171' : (base > 0 ? '#9ca3af' : '#6b7280');
                        capNote = `<div style="font-size:7px;color:${cor};margin-top:2px">Teto do nível: ${base + val}/${capK}${base > 0 ? ` (já possuía +${base})` : ''}${roomLeft <= 0 ? ' — cheio' : ''}</div>`;
                    }
                    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#0a0f1a;border-radius:10px;border:1px solid ${val>0?tc+'44':'#1f2937'}">
                        <div>
                            <div style="font-size:11px;font-weight:700;color:${val>0?tc:'#d1d5db'}">${info.label}</div>
                            <div style="font-size:8px;color:#6b7280">${info.desc}</div>
                            ${capNote}
                            ${k === 'atributos' && val > 0 ? _phAttrPickerHtml() : ''}
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
                        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:${tc};text-transform:uppercase;letter-spacing:2px">5 Graus do 1º Hatsu</div>
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
                const total = ['acerto','atributos','dano','alcance','area','duracao','cd','alvos','custo']
                    .reduce(function (s, v) { return s + (alloc[v] || 0); }, 0);
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
                const total = ['acerto','atributos','dano','alcance','area','duracao','cd','alvos','custo']
                    .reduce(function (s, k) { return s + (alloc[k] || 0); }, 0);
                if (total !== TOTAL) return;
                if ((alloc.atributos || 0) > 0 && !alloc._atributosAttr) {
                    alert('Escolha em qual atributo os Graus de Atributos serão aplicados.');
                    return;
                }
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

        // ── Modal de distribuição de Atributos do Constructo (Golem de Aura e afins) ──────────
        // Mesmo padrão visual/interação do modal de 5 Graus do 1º Hatsu acima. O orçamento de
        // pontos é o modificador de INT do USUÁRIO (não do constructo) — mesma regra já usada
        // pelos botões +/- antigos (rev. Manual: "atributos do Constructo vêm do bônus de
        // Inteligência do Materializador").
        window._showConstructoAttrModal = function(char, hatsuIdx, cIdx) {
            // cIdx = qual cópia do constructo está sendo editada (0 = a primeira).
            cIdx = parseInt(cIdx) || 0;
            const h = char.hatsus[hatsuIdx];
            if (!h) return;
            const cst = window._hCst ? window._hCst(h, cIdx) : (h.constructo = h.constructo || {});
            const hatsuClasse = h.classe || char.class || '';
            const catDB = (window.HATSU_DB && window.HATSU_DB.categorias[hatsuClasse]) || {};
            const tc = catDB.cor || '#00ff88';
            const intMod = getMod((char.attributes.INT || {}).value || 10);
            const TOTAL = Math.max(0, intMod);
            const ATTRS = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'PRE'];
            const ATTR_INFO = {
                FOR: { icon: '💪', desc: 'Dano/acerto do constructo (se escolhido no ataque)' },
                DES: { icon: '🏃', desc: 'Dano/acerto do constructo (se escolhido no ataque)' },
                CON: { icon: '❤️', desc: '+2 PV por ponto (Golem de Aura) e +1 CA por ponto' },
                INT: { icon: '🧠', desc: 'Perícias e testes mentais do constructo' },
                SAB: { icon: '👁️', desc: 'Perícias e testes de percepção do constructo' },
                PRE: { icon: '🎭', desc: 'Perícias e testes sociais do constructo' },
            };
            const existing = cst.atributos || {};
            const alloc = {};
            ATTRS.forEach(a => alloc[a] = Math.max(0, existing[a] || 0));

            const overlay = document.createElement('div');
            overlay.id = 'constructo-attr-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000dd;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif';

            function rebuild() {
                const total = Object.values(alloc).reduce((s, v) => s + v, 0);
                const remaining = TOTAL - total;
                const done = total === TOTAL;
                const rowsHtml = ATTRS.map(a => {
                    const info = ATTR_INFO[a];
                    const val = alloc[a] || 0;
                    const canAdd = remaining > 0;
                    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#0a0f1a;border-radius:10px;border:1px solid ${val > 0 ? tc + '44' : '#1f2937'}">
                        <div>
                            <div style="font-size:11px;font-weight:700;color:${val > 0 ? tc : '#d1d5db'}">${info.icon} ${a}</div>
                            <div style="font-size:8px;color:#6b7280">${info.desc}</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px">
                            <button onclick="window._caGrauDecr('${a}')"
                                style="width:28px;height:28px;border-radius:7px;background:${val > 0 ? tc + '22' : '#1f2937'};border:1px solid ${val > 0 ? tc + '44' : '#374151'};color:${val > 0 ? tc : '#4b5563'};font-size:16px;font-weight:900;cursor:${val > 0 ? 'pointer' : 'default'};line-height:1">−</button>
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:14px;color:${val > 0 ? tc : '#4b5563'};min-width:18px;text-align:center">${val}</span>
                            <button onclick="window._caGrauIncr('${a}')"
                                style="width:28px;height:28px;border-radius:7px;background:${canAdd ? tc + '22' : '#1f2937'};border:1px solid ${canAdd ? tc + '44' : '#374151'};color:${canAdd ? tc : '#4b5563'};font-size:16px;font-weight:900;cursor:${canAdd ? 'pointer' : 'default'};line-height:1">+</button>
                        </div>
                    </div>`;
                }).join('');
                overlay.innerHTML = `
                <div style="background:#0d1117;border:2px solid ${tc};border-radius:20px;padding:24px;width:100%;max-width:380px;box-shadow:0 0 40px ${tc}44;max-height:90vh;overflow-y:auto">
                    <div style="text-align:center;margin-bottom:16px">
                        <div style="font-size:24px;margin-bottom:6px">🐣</div>
                        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:${tc};text-transform:uppercase;letter-spacing:2px">Atributos do Constructo</div>
                        <div style="font-size:9px;color:#9ca3af;margin-top:6px;line-height:1.5">
                            Distribua <b style="color:${tc}">${TOTAL} ponto${TOTAL !== 1 ? 's' : ''}</b> (seu modificador de INT) entre os atributos do constructo.
                        </div>
                        <div style="margin-top:10px;display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:20px;background:${done ? tc + '22' : '#1f2937'};border:1px solid ${done ? tc + '55' : '#374151'}">
                            <span style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:18px;color:${done ? tc : '#9ca3af'}">${total}/${TOTAL}</span>
                            <span style="font-size:9px;color:#6b7280">${remaining > 0 ? remaining + ' restante' + (remaining > 1 ? 's' : '') : 'Completo ✓'}</span>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px">${rowsHtml}</div>
                    <button onclick="window._confirmConstructoAttr()" ${done ? '' : 'disabled'}
                        style="width:100%;padding:13px;border-radius:10px;background:${done ? tc : '#374151'};border:none;color:${done ? '#000' : '#6b7280'};font-family:'Orbitron',sans-serif;font-weight:900;font-size:11px;text-transform:uppercase;cursor:${done ? 'pointer' : 'not-allowed'};letter-spacing:1px;box-shadow:${done ? '0 0 16px ' + tc + '55' : 'none'};transition:all .2s">
                        Concluir Construção
                    </button>
                    <button onclick="document.getElementById('constructo-attr-overlay').remove()" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;background:transparent;border:1px solid #374151;color:#6b7280;font-size:9px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:1px">Cancelar</button>
                </div>`;
            }

            window._caGrauIncr = function(a) {
                const total = Object.values(alloc).reduce((s, v) => s + v, 0);
                if (total >= TOTAL) return;
                alloc[a] = (alloc[a] || 0) + 1;
                rebuild();
            };
            window._caGrauDecr = function(a) {
                if ((alloc[a] || 0) <= 0) return;
                alloc[a]--;
                rebuild();
            };
            window._confirmConstructoAttr = function() {
                const total = Object.values(alloc).reduce((s, v) => s + v, 0);
                if (total !== TOTAL) return;
                if (!confirm("Após concluir a construção do constructo, os atributos só poderão ser editados ao receber mais P.N para editar o Hatsu (ou seja, ao subir de nível). Tem certeza que deseja concluir?")) return;
                const alvo = window._hCst
                    ? window._hCst(char.hatsus[hatsuIdx], cIdx)
                    : (char.hatsus[hatsuIdx].constructo = char.hatsus[hatsuIdx].constructo || {});
                alvo.atributos = Object.assign({}, alloc);
                alvo.atributosConcluidos = true;
                alvo.atributosConcluidosNivel = char.level;
                saveCharacter(char);
                overlay.remove();
                render(true);
            };

            document.body.appendChild(overlay);
            rebuild();
        };

        window._openConstructoAttrModal = function(hatsuIdx, cIdx) {
            const char = state.currentChar;
            window._showConstructoAttrModal(char, hatsuIdx, parseInt(cIdx) || 0);
        };

        // ── Editar Traços Raciais (ficha já criada) ───────────────────────────────────────────
        // Permite preencher retroativamente escolhas que não existiam quando a ficha foi criada
        // (ex: "Esforço no lugar de talento" do Humano, ou a escolha de característica de raças que
        // hoje viraram `opcoes_caracteristica` mas antes só tinham texto informativo).
        window._openRaceTraitsModal = function() {
            const char = state.currentChar;
            if (!char) return;
            const isHumano = char.race === 'Humano Comum';
            const raceData = SYSTEM_DB.racas.find(r => r.nome === char.race);
            const hasChoice = !!(raceData && (raceData.opcoes_caracteristica || []).length > 0);
            if (!isHumano && !hasChoice) { alert('Esta raça não tem nenhuma característica de escolha para editar.'); return; }

            const tc = getComputedStyle(document.documentElement).getPropertyValue('--theme-color-hex').trim() || '#00ff9d';
            const esforcoDB = SYSTEM_DB.esforcoRacas || {};
            const esforcoRaceNames = Object.keys(esforcoDB);

            // Rascunho local — só grava no personagem ao confirmar.
            const draft = {
                effortRace: char.effortRace || esforcoRaceNames[0] || null,
                effortTrait: char.effortTrait || null,
                raceFeatureChoice: char.raceFeatureChoice || null,
            };

            const overlay = document.createElement('div');
            overlay.id = 'race-traits-modal-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000dd;display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;font-family:Rajdhani,sans-serif';

            function rebuild() {
                let bodyHtml = '';
                if (isHumano) {
                    if (!draft.effortRace) draft.effortRace = esforcoRaceNames[0];
                    const esforcoData = esforcoDB[draft.effortRace] || { opcoes: [] };
                    bodyHtml = `
                        <h4 style="font-size:10px;font-weight:900;color:${tc};text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">💪 Esforço no Lugar de Talento</h4>
                        <p style="font-size:9px;color:#9ca3af;margin-bottom:10px;line-height:1.5">Escolha UMA característica (sem o bônus de atributo) de uma destas raças:</p>
                        <select id="rtm-race-select" style="width:100%;background:#000;border:1px solid #374151;border-radius:8px;padding:8px;color:#fff;font-size:12px;margin-bottom:10px">
                            ${esforcoRaceNames.map(rn => `<option value="${rn}" ${draft.effortRace === rn ? 'selected' : ''}>${rn}</option>`).join('')}
                        </select>
                        <div style="display:flex;flex-direction:column;gap:8px">
                            ${esforcoData.opcoes.map(o => `
                                <label style="display:flex;gap:10px;align-items:flex-start;padding:10px;border-radius:10px;border:1.5px solid ${draft.effortTrait === o.nome ? tc : '#1f2937'};background:${draft.effortTrait === o.nome ? tc + '11' : '#0a0f1a'};cursor:pointer">
                                    <input type="radio" name="rtm-trait" value="${o.nome}" ${draft.effortTrait === o.nome ? 'checked' : ''} style="margin-top:3px" onclick="window._rtmSetTrait('${o.nome.replace(/'/g, "\\'")}')">
                                    <div>
                                        <div style="font-size:11px;font-weight:700;color:#fff">${o.nome}</div>
                                        <div style="font-size:9px;color:#9ca3af;margin-top:2px;line-height:1.4">${o.efeito}</div>
                                    </div>
                                </label>`).join('')}
                        </div>`;
                } else {
                    bodyHtml = `
                        <h4 style="font-size:10px;font-weight:900;color:${tc};text-transform:uppercase;letter-spacing:2px;margin-bottom:10px">Escolha uma Característica</h4>
                        <div style="display:flex;flex-direction:column;gap:8px">
                            ${(raceData.opcoes_caracteristica || []).map(f => `
                                <label style="display:flex;gap:10px;align-items:flex-start;padding:10px;border-radius:10px;border:1.5px solid ${draft.raceFeatureChoice === f.nome ? tc : '#1f2937'};background:${draft.raceFeatureChoice === f.nome ? tc + '11' : '#0a0f1a'};cursor:pointer">
                                    <input type="radio" name="rtm-featurechoice" value="${f.nome}" ${draft.raceFeatureChoice === f.nome ? 'checked' : ''} style="margin-top:3px" onclick="window._rtmSetFeatureChoice('${f.nome.replace(/'/g, "\\'")}')">
                                    <div>
                                        <div style="font-size:11px;font-weight:700;color:#fff">${f.nome}</div>
                                        <div style="font-size:9px;color:#9ca3af;margin-top:2px;line-height:1.4">${f.efeito || f.mecanica || ''}</div>
                                    </div>
                                </label>`).join('')}
                        </div>`;
                }
                const canConfirm = isHumano ? !!draft.effortTrait : !!draft.raceFeatureChoice;
                overlay.innerHTML = `
                    <div style="background:#0d1117;border:2px solid ${tc};border-radius:20px;padding:22px;width:100%;max-width:400px;max-height:85vh;overflow-y:auto;box-shadow:0 0 40px ${tc}44">
                        <div style="font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;color:${tc};text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">✏️ Editar Traços Raciais</div>
                        <div style="font-size:9px;color:#6b7280;margin-bottom:16px">${char.race} — ficha criada antes dessa opção existir? Agora dá pra escolher.</div>
                        ${bodyHtml}
                        <div style="display:flex;gap:8px;margin-top:18px">
                            <button onclick="document.getElementById('race-traits-modal-overlay').remove()" style="flex:1;padding:12px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Cancelar</button>
                            <button onclick="window._rtmConfirm()" ${canConfirm ? '' : 'disabled'} style="flex:2;padding:12px;border-radius:10px;background:${canConfirm ? tc : '#374151'};border:none;color:${canConfirm ? '#000' : '#6b7280'};font-family:'Orbitron',sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:${canConfirm ? 'pointer' : 'not-allowed'}">✓ Salvar</button>
                        </div>
                    </div>`;
                // innerHTML recria o <select>, então o listener precisa ser religado a cada rebuild.
                const sel = document.getElementById('rtm-race-select');
                if (sel) sel.onchange = function() { draft.effortRace = this.value; draft.effortTrait = null; rebuild(); };
            }

            window._rtmSetTrait = function(nome) { draft.effortTrait = nome; rebuild(); };
            window._rtmSetFeatureChoice = function(nome) { draft.raceFeatureChoice = nome; rebuild(); };
            window._rtmConfirm = function() {
                if (isHumano) {
                    char.effortRace = draft.effortRace;
                    char.effortTrait = draft.effortTrait;
                } else {
                    char.raceFeatureChoice = draft.raceFeatureChoice;
                }
                saveCharacter(char);
                overlay.remove();
                render(true);
            };

            document.body.appendChild(overlay);
            rebuild();
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

        // ── Modal de dano no PV, com Redução de Dano ────────────────────────────────
        // O jogador digita o dano BRUTO e o app desconta a RD. As fontes passivas vêm
        // ligadas; as condicionais vêm desligadas com a condição escrita ao lado, porque
        // dependem do golpe, do alvo ou da rolagem e o app não tem como saber sozinho.
        // Nada é descontado escondido: a conta aparece inteira antes de aplicar.
        window._pvRdLigadas = {};
        window._showPvDamageModal = function () {
            const char = state.currentChar;
            const fontes = (window.calcFontesRD ? window.calcFontesRD(char) : []);
            // Estado inicial: passivas ligadas, condicionais desligadas.
            window._pvRdLigadas = {};
            fontes.forEach(function (f) { window._pvRdLigadas[f.id] = !!f.passiva; });

            const overlay = document.createElement('div');
            overlay.id = 'pv-dmg-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px;font-family:Rajdhani,sans-serif';
            const fontesHtml = fontes.length
                ? fontes.map(function (f) {
                    return '<div onclick="window._pvRdToggle(\'' + f.id + '\')" id="rd-row-' + f.id + '" style="display:flex;align-items:center;gap:9px;background:#111827;border:1px solid #1f2937;border-radius:10px;padding:9px 11px;margin-bottom:6px;cursor:pointer">'
                        + '<div id="rd-sw-' + f.id + '" style="width:34px;height:19px;border-radius:10px;background:' + (f.passiva ? '#4ade80' : '#374151') + ';position:relative;flex-shrink:0;transition:all .15s">'
                        + '<div style="position:absolute;top:3px;left:' + (f.passiva ? '18px' : '3px') + ';width:13px;height:13px;border-radius:50%;background:#0d1117;transition:all .15s"></div></div>'
                        + '<div style="flex:1;min-width:0">'
                        + '<div style="font-size:10px;font-weight:700;color:#d1d5db">' + f.nome + ' <span style="color:#4ade80">−' + f.valor + '</span></div>'
                        + '<div style="font-size:8px;color:#6b7280;line-height:1.3">' + f.condicao + '</div></div></div>';
                }).join('')
                : '<div style="font-size:9px;color:#4b5563;text-align:center;padding:10px;font-style:italic">Nenhuma fonte de Redução de Dano neste personagem.</div>';

            overlay.innerHTML =
                '<div style="background:#0d1117;border:2px solid #ef4444;border-radius:18px;padding:22px;width:100%;max-width:360px;max-height:86vh;overflow-y:auto;box-shadow:0 0 40px #ef444433">'
                + '<div style="text-align:center;margin-bottom:14px">'
                +   '<div style="font-size:20px;margin-bottom:4px">💔</div>'
                +   '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:12px;color:#f87171;text-transform:uppercase;letter-spacing:2px">Dano Recebido</div>'
                + '</div>'
                + '<div style="margin-bottom:12px">'
                +   '<label style="font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px">Dano bruto (antes da RD):</label>'
                +   '<input id="pv-dmg-input" type="number" min="0" placeholder="Ex: 18" oninput="window._pvDmgUpdate()"'
                +     ' style="width:100%;box-sizing:border-box;background:#060d1a;border:2px solid #374151;border-radius:10px;padding:12px 14px;color:#fff;font-family:Orbitron,sans-serif;font-weight:900;font-size:22px;outline:none;text-align:center">'
                + '</div>'
                + (fontes.length ? '<div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px">🛡 Redução de Dano</div>' : '')
                + fontesHtml
                + '<div id="pv-dmg-preview" style="text-align:center;margin:12px 0;font-size:11px;color:#6b7280;min-height:34px"></div>'
                + '<div style="display:flex;gap:8px">'
                +   '<button onclick="document.getElementById(\'pv-dmg-overlay\').remove()" style="flex:1;padding:11px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Cancelar</button>'
                +   '<button onclick="window._pvDmgAplicar()" style="flex:2;padding:11px;border-radius:10px;background:#ef4444;border:none;color:#fff;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer">Aplicar</button>'
                + '</div></div>';
            document.body.appendChild(overlay);
            setTimeout(function () { const i = document.getElementById('pv-dmg-input'); if (i) i.focus(); }, 50);
            window._pvDmgUpdate();
        };

        window._pvRdToggle = function (id) {
            window._pvRdLigadas[id] = !window._pvRdLigadas[id];
            const sw = document.getElementById('rd-sw-' + id);
            if (sw) {
                const on = window._pvRdLigadas[id];
                sw.style.background = on ? '#4ade80' : '#374151';
                sw.firstElementChild.style.left = on ? '18px' : '3px';
            }
            window._pvDmgUpdate();
        };

        window._pvRdTotal = function () {
            const fontes = (window.calcFontesRD ? window.calcFontesRD(state.currentChar) : []);
            return fontes.reduce(function (s, f) { return s + (window._pvRdLigadas[f.id] ? (f.valor || 0) : 0); }, 0);
        };

        window._pvDmgUpdate = function () {
            const inp = document.getElementById('pv-dmg-input');
            const prev = document.getElementById('pv-dmg-preview');
            if (!prev) return;
            const bruto = Math.max(0, parseInt(inp && inp.value) || 0);
            const rd = window._pvRdTotal();
            const liquido = Math.max(0, bruto - rd);
            if (!bruto) { prev.innerHTML = rd > 0 ? ('RD ativa: <b style="color:#4ade80">−' + rd + '</b>') : ''; return; }
            prev.innerHTML = '<span style="color:#9ca3af">' + bruto + '</span>'
                + (rd > 0 ? ' <span style="color:#4ade80">− ' + rd + ' (RD)</span>' : '')
                + ' = <b style="font-family:Orbitron,sans-serif;font-size:18px;color:#f87171">' + liquido + '</b> de dano'
                + (rd > 0 && liquido === 0 ? '<div style="font-size:9px;color:#4ade80;margin-top:3px">A RD absorveu o golpe inteiro.</div>' : '');
        };

        window._pvDmgAplicar = function () {
            const inp = document.getElementById('pv-dmg-input');
            const bruto = Math.max(0, parseInt(inp && inp.value) || 0);
            if (!bruto) { if (inp) inp.style.borderColor = '#ef4444'; return; }
            const liquido = Math.max(0, bruto - window._pvRdTotal());
            document.getElementById('pv-dmg-overlay')?.remove();
            if (liquido > 0) updateVital('pv', -liquido);
            else render(true);
        };

        // ── Contador de rodada do personagem ────────────────────────────────────────
        // Um contador só, compartilhado por Hatsus e Princípios ativos. Passar a rodada
        // desconta de tudo que tem duração contada e desliga o que chegou a zero.
        // O que tem duração constante (Relíquia Viva, Vínculo Sustentado, Maldição pelo
        // temporizador) não entra na contagem e só sai no desligamento manual.
        window._ativarHatsu = function (idx, rodadas, constante) {
            const char = state.currentChar;
            if (!char.hatsusAtivos) char.hatsusAtivos = {};
            char.hatsusAtivos[idx] = {
                constante: !!constante,
                rodadas: constante ? null : Math.max(0, parseInt(rodadas) || 0),
                max: constante ? null : Math.max(0, parseInt(rodadas) || 0),
            };
            saveCharacter(char);
            render(true);
        };

        // Ativar direto da aba Ficha, sem abrir o Hatsu. A duração vem da mesma regra
        // usada na tela de detalhe (calcDuracaoHatsu), para os dois lugares concordarem.
        window._ativarHatsuDaFicha = function (idx) {
            const char = state.currentChar;
            const h = (char.hatsus || [])[idx];
            if (!h) return;
            const info = window.calcDuracaoHatsu ? window.calcDuracaoHatsu(h, char) : { rodadas: 0, constante: false };
            window._ativarHatsu(idx, info.rodadas, info.constante);
        };

        window._desativarHatsu = function (idx) {
            const char = state.currentChar;
            if (char.hatsusAtivos) delete char.hatsusAtivos[idx];
            saveCharacter(char);
            render(true);
        };

        // Quantas rodadas cada princípio dura. Null = sem contagem (sai manual).
        window.PRINCIPIO_RODADAS = {
            ten: 1,      // vale pela reação
            ren: 1,      // próximo ataque do turno
            ken: 2,      // CA dobrada por 2 rodadas
            ko: 1,       // próximo golpe, CA reduzida até o próximo turno
            ryu: 6,      // 6 rodadas: exemplos 1-3 são padrão, 4-6 exigem Superior
            shu: null,   // rodadas conforme aprimoramento — resolvido na ativação
            gyo: 1,
            en: 1,
            inp: null,   // rodadas conforme aprimoramento
            zetsu: null, // conta ao contrário: é CARGA, resolvida na ativação
        };

        window._passarRodada = function () {
            const char = state.currentChar;
            const expirados = [];

            // Hatsus com duração contada
            const ha = char.hatsusAtivos || {};
            Object.keys(ha).forEach(function (k) {
                const a = ha[k];
                if (!a || a.constante) return;
                a.rodadas = Math.max(0, (a.rodadas || 0) - 1);
                if (a.rodadas <= 0) {
                    const h = (char.hatsus || [])[k];
                    expirados.push('Hatsu "' + ((h && h.nome) || ('#' + (parseInt(k) + 1))) + '"');
                    delete ha[k];
                }
            });

            // Princípios com duração contada
            const pr = char.principiosRodadas || {};
            const at = char.principiosAtivos || {};
            const concluidos = [];
            Object.keys(at).forEach(function (k) {
                if (!at[k]) return;
                if (pr[k] == null) return; // sem contagem: sai manual
                pr[k] = Math.max(0, pr[k] - 1);
                if (pr[k] > 0) return;

                if (k === 'zetsu') {
                    // ZETSU não expira: ele COMPLETA. A contagem é o tempo de espera
                    // (3, 2 ou 1 rodada conforme o investimento) e, ao acabar, concede
                    // os benefícios — aura recuperada e reações. Por isso ele é contado
                    // separado de tudo que "expira".
                    const z = window.calcZetsuBonus ? window.calcZetsuBonus(char) : { auraPct: 0, reacoes: 0, furtividade: 0 };
                    const ganhoAura = Math.round(((char.vitals.auraMax || 100) * (z.auraPct || 0)) / 100);
                    if (ganhoAura > 0) {
                        char.vitals.aura = Math.min(char.vitals.auraMax || 100, (char.vitals.aura || 0) + ganhoAura);
                    }
                    if (z.reacoes > 0) {
                        const reaMaxAtual = window.calcReacoesMax ? window.calcReacoesMax(char) : null;
                        const base = (char.vitals.rea !== undefined) ? char.vitals.rea : (reaMaxAtual != null ? reaMaxAtual : 0);
                        char.vitals.rea = base + z.reacoes;
                    }
                    concluidos.push('ZETSU: +' + ganhoAura + ' de aura'
                        + (z.reacoes > 0 ? ', +' + z.reacoes + ' Reação(ões)' : '')
                        + (z.furtividade > 0 ? ', +' + z.furtividade + ' Furtividade nesta rodada' : ''));
                } else {
                    expirados.push(k.toUpperCase());
                }
                delete at[k];
                delete pr[k];
                if (k === 'gyo') delete char.gyoAlvo;
            });

            char.rodadaAtual = (parseInt(char.rodadaAtual) || 0) + 1;
            saveCharacter(char);
            render(true);
            if (concluidos.length && window._showXpToast) {
                window._showXpToast('👁️ ' + concluidos.join(' | '));
            }
            if (expirados.length && window._showXpToast) {
                setTimeout(function () { window._showXpToast('⏳ Expirou: ' + expirados.join(', ')); }, concluidos.length ? 2400 : 0);
            }
        };

        window._zerarRodadas = function () {
            const char = state.currentChar;
            char.rodadaAtual = 0;
            char.hatsusAtivos = {};
            char.principiosAtivos = {};
            char.principiosRodadas = {};
            delete char.gyoAlvo;
            saveCharacter(char);
            render(true);
        };

        // ── Princípios de Nen ATIVOS ────────────────────────────────────────────────
        // Até aqui o botão do princípio só descontava aura e mostrava um texto: nenhum
        // número da ficha mudava. Agora o estado fica guardado em char.principiosAtivos,
        // e os efeitos numéricos leem daí (RD do TEN, CA do KEN/KO/RYU/SHU, atributo do GYO).
        //
        // O desligamento é MANUAL, por decisão de mesa: o app não acompanha as rodadas, e
        // desligar sozinho na hora errada atrapalharia mais que ajudar. Cada princípio mostra
        // a duração no rótulo para o jogador lembrar.
        window.principioAtivo = function (char, key) {
            return !!(((char || {}).principiosAtivos) || {})[key];
        };

        window._desativarPrincipio = function (key) {
            const char = state.currentChar;
            if (!char.principiosAtivos) char.principiosAtivos = {};
            delete char.principiosAtivos[key];
            if (char.principiosRodadas) delete char.principiosRodadas[key];
            if (key === 'gyo') delete char.gyoAlvo;
            saveCharacter(char);
            render(true);
        };

        window._desativarTodosPrincipios = function () {
            const char = state.currentChar;
            char.principiosAtivos = {};
            delete char.gyoAlvo;
            saveCharacter(char);
            render(true);
        };

        // GYO pergunta onde a aura foi concentrada. Nos olhos, é percepção (narrativo).
        // No corpo, dá bônus num atributo físico — e se for CON, a CA sobe junto, porque
        // a CA sem armadura é 10 + modificador de CON.
        window._abrirGyoAlvo = function () {
            const char = state.currentChar;
            const bonus = (window.calcAvancadoBonus ? window.calcAvancadoBonus(char, 'gyo') : { attrBonus: 3 }).attrBonus || 3;
            const tc = getComputedStyle(document.documentElement).getPropertyValue('--theme-color-hex').trim() || '#00ff9d';
            const ov = document.createElement('div');
            ov.id = 'gyo-overlay';
            ov.style.cssText = 'position:fixed;inset:0;background:#000000ee;display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;font-family:Rajdhani,sans-serif';
            const btn = function (val, titulo, sub) {
                return '<div onclick="window._hSetGyoAlvo(\'' + val + '\')" style="background:#111827;border:1px solid #1f2937;border-radius:11px;padding:11px 13px;margin-bottom:7px;cursor:pointer">'
                    + '<div style="font-size:11px;font-weight:900;color:' + tc + '">' + titulo + '</div>'
                    + '<div style="font-size:9px;color:#6b7280;margin-top:2px;line-height:1.4">' + sub + '</div></div>';
            };
            ov.innerHTML = '<div style="background:#0d1117;border:2px solid ' + tc + ';border-radius:20px;padding:20px;width:100%;max-width:380px">'
                + '<div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:12px;color:' + tc + ';text-transform:uppercase;letter-spacing:2px;margin-bottom:4px">🔍 GYO — onde concentrar?</div>'
                + '<div style="font-size:9px;color:#6b7280;margin-bottom:12px">A concentração de aura vai para uma parte do corpo. A escolha muda o efeito.</div>'
                + btn('olhos', '👁 Olhos', 'Enxerga aura e o que está oculto (IN). Custo menor, efeito narrativo.')
                + '<div style="font-size:8px;font-weight:900;color:#4b5563;text-transform:uppercase;letter-spacing:2px;margin:10px 0 6px">Corpo — +' + bonus + ' no atributo</div>'
                + btn('FOR', '💪 Força', 'Golpes e testes de Força.')
                + btn('DES', '🏃 Destreza', 'Reflexos e testes de Destreza.')
                + btn('CON', '🛡 Constituição', 'Resistência — e a CA sobe junto, por causa do 10 + CON.')
                + '<button onclick="document.getElementById(\'gyo-overlay\').remove()" style="width:100%;margin-top:6px;padding:10px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:9px;text-transform:uppercase;cursor:pointer">Cancelar</button>'
                + '</div>';
            document.body.appendChild(ov);
        };

        window._hSetGyoAlvo = function (alvo) {
            const char = state.currentChar;
            if (!char.principiosAtivos) char.principiosAtivos = {};
            char.principiosAtivos.gyo = true;
            char.gyoAlvo = alvo;
            if (!char.principiosRodadas) char.principiosRodadas = {};
            char.principiosRodadas.gyo = 1;
            document.getElementById('gyo-overlay')?.remove();
            saveCharacter(char);
            render(true);
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

            // Effect messages per principle — já refletem o Aprimoramento (P.N extra investido)
            const nivel = d[key] || 1;
            const tenRD = window.calcTenRD ? window.calcTenRD(char) : 0;
            const rBon = window.calcRenBonus ? window.calcRenBonus(char) : { grau:1, teste:0, teste1x:0 };
            const zBon = window.calcZetsuBonus ? window.calcZetsuBonus(char) : { auraPct:0, furtividade:0, rodadas:3 };
            const advB = window.calcAvancadoBonus ? window.calcAvancadoBonus(char, key) : {};
           const EFEITOS = {
    ten:   ['🛡️ TEN ativado (Reação ou Ação Bônus) — +' + tenRD + ' RD (Corte, Impacto, Explosão) por esta reação. Interrompe intimidação por aura.',
            '🛡️ TEN ativado (Reação ou Ação Bônus) — +' + tenRD + ' RD. Imune a projéteis que igualem CA.',
            '🛡️ TEN ativado (Reação ou Ação Bônus) — +' + tenRD + ' RD. Máxima proteção.'],
    ren:   ['💪 REN ativado — próximo ataque no turno: +' + rBon.grau + ' Grau de dano.',
            '💪 REN ativado — +' + rBon.grau + ' Grau de dano e +' + rBon.teste + ' em Intimidação/Arcanismo com REN.',
            '💪 REN ativado — Intermediário + 1×/dia +' + rBon.teste1x + ' sem custo de aura.'],
    zetsu: ['👁️ ZETSU ativado — aguarde 3 rodadas: +' + zBon.auraPct + '% Aura, +1 Reação, +' + zBon.furtividade + ' Furtividade.',
            '👁️ ZETSU ativado — aguarde 2 rodadas: +' + zBon.auraPct + '% Aura, +1 Reação, +' + zBon.furtividade + ' Furtividade.',
            '👁️ ZETSU ativado — aguarde 1 rodada: +' + zBon.auraPct + '% Aura, +2 Reações, +' + zBon.furtividade + ' Furtividade.'],
    en:    ['🔵 EN ativado — detecta forma e movimento em ' + (advB.diametro||3) + 'm por 1 rodada. Ataque de reação vs quem entrar, sem gastar Ação Principal.'],
    inp:   ['🌑 IN ativado — objeto de aura oculto por ' + (advB.rodadas||1) + ' rodada(s).'],
    gyo:   ['👁️ GYO ativado — visão de aura e objetos ocultos (ou +' + (advB.attrBonus||3) + ' FOR/DES/CON por 1 rodada se corporal).'],
    shu:   ['⚡ SHU ativado — objeto envolto: +1d4 Dano e CA por ' + (advB.rodadas||1) + ' rodada(s). Golpe mirado sem ônus.'],
    ken:   ['🏯 KEN ativado — CA dobrada por 2 rodadas. Consome ' + (advB.reacoes||4) + ' Reações.'],
    ko:    ['🔥 KO ativado — próximo golpe: dano ×3. ATENÇÃO: CA reduzida em 80% até próximo turno' + (advB.caBonus>0?(' (+' + advB.caBonus + ' restante)'):'') + '!'],
    ryu:   ['🌊 RYU ativado — Exemplos 1-3' + (advB.sup?'-6':'') + ' de RYU disponíveis' + (advB.tabelaBonus>0?(' (+' + advB.tabelaBonus + ' em todos os valores)'):'') + '. Múltiplos contra-ataques permitidos.'],
};
            const msgs = EFEITOS[key];
            const msg = msgs ? (msgs[nivel-1] || msgs[msgs.length-1]) : 'Princípio ativado.';

            // Guarda o princípio como ATIVO. É isso que faz os efeitos numéricos valerem:
            // sem esse registro, a ativação só descontava aura e mostrava o texto.
            // O GYO pergunta antes onde a aura foi concentrada — e essa resposta é que
            // define o efeito, então a ativação dele acontece dentro do pop-up.
            if (!char.principiosAtivos) char.principiosAtivos = {};
            if (key === 'gyo') {
                if (window._abrirGyoAlvo) { window._abrirGyoAlvo(); }
            } else if (key === 'zetsu') {
                // ZETSU entra na contagem como CARGA: o tempo de espera vem do nível
                // investido (3 rodadas no Básico, 2 no Intermediário, 1 na Maestria) e o
                // benefício é concedido quando a contagem zera, não durante.
                const zb = window.calcZetsuBonus ? window.calcZetsuBonus(char) : { rodadas: 3 };
                char.principiosAtivos.zetsu = true;
                if (!char.principiosRodadas) char.principiosRodadas = {};
                char.principiosRodadas.zetsu = Math.max(1, zb.rodadas || 3);
            } else {
                char.principiosAtivos[key] = true;
                // Registra a duração para o contador de rodada. SHU e IN dependem do
                // aprimoramento comprado, então lemos o valor calculado.
                if (!char.principiosRodadas) char.principiosRodadas = {};
                let rod = (window.PRINCIPIO_RODADAS || {})[key];
                if (key === 'shu' || key === 'inp') rod = (advB && advB.rodadas) || 1;
                char.principiosRodadas[key] = (rod == null) ? null : rod;
            }

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
