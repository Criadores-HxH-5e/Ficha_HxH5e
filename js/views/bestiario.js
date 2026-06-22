        // ── RENDER BESTIÁRIO ────────────────────────────────────────
        window.renderBestiario = function(container) {
          if (!state.isAdmin && !state.isMestre) { state.view = 'LIST'; render(); return; }

          const S = state;
          const search = (S.bestiarioSearch||'').toLowerCase();
          const filter = S.bestiarioFilter || 'TODOS';
          const tab    = S.bestiarioTab    || 'LISTA';

          const CATS = ['TODOS','BESTA NATURAL','BESTA MÁGICA','BESTA DE NEN','ABERRAÇÃO','MONSTRUOSIDADE','PLAYTEST'];
          const CAT_COLOR = {
            'BESTA NATURAL':'#22c55e','BESTA MÁGICA':'#a855f7','BESTA DE NEN':'#06b6d4',
            'ABERRAÇÃO':'#f97316','MONSTRUOSIDADE':'#ef4444','PLAYTEST':'#f59e0b','PLANTA':'#4ade80'
          };

          function filteredMonsters() {
            return window.BESTIARY_DATA.filter(m => {
              const matchCat = filter === 'TODOS' || m.cat === filter;
              const matchSearch = !search ||
                m.nome.toLowerCase().includes(search) ||
                m.tipo.toLowerCase().includes(search) ||
                m.cat.toLowerCase().includes(search);
              return matchCat && matchSearch;
            });
          }

          function monsterToDiscord(m) {
            const div = '───────────────────────────────────';
            let txt = `**${m.nome.toUpperCase()}**\n`;
            txt += `*${m.tipo}*\n`;
            txt += `${div}\n`;
            txt += `**CA:** ${m.ca}  |  **PV:** ${m.pv}  |  **Desl.:** ${m.desl}`;
            if (m.reacoes) txt += `  |  **Reações:** ${m.reacoes}`;
            txt += `\n${div}\n`;
            if (m.for !== '—') {
              txt += `\`\`\`\n| FOR        | DES        | CON        | INT        | SAB        | CAR        |\n`;
              txt += `|------------|------------|------------|------------|------------|------------|\n`;
              txt += `| ${m.for.padEnd(10)} | ${m.des.padEnd(10)} | ${m.con.padEnd(10)} | ${m.int.padEnd(10)} | ${m.sab.padEnd(10)} | ${m.car.padEnd(10)} |\n\`\`\`\n`;
            }
            if (m.pericias)         txt += `**Perícias:** ${m.pericias}\n`;
            if (m.trs)              txt += `**TRs:** ${m.trs}\n`;
            if (m.imunidades)       txt += `**Imunidades:** ${m.imunidades}\n`;
            if (m.resistencias)     txt += `**Resistências:** ${m.resistencias}\n`;
            if (m.vulnerabilidades) txt += `**Vulnerabilidades:** ${m.vulnerabilidades}\n`;
            if (m.sentidos)         txt += `**Sentidos:** ${m.sentidos}\n`;
            if (m.lingua)           txt += `**Língua:** ${m.lingua}\n`;
            if (m.tracos && m.tracos.length) {
              txt += `${div}\n**Traços Especiais**\n`;
              m.tracos.forEach(t => { txt += `▸ **${t.n}.** ${t.d}\n`; });
            }
            if (m.acoes && m.acoes.length) {
              txt += `${div}\n**Ações**\n`;
              m.acoes.forEach(a => { txt += `▸ **${a.n}.** ${a.d}\n`; });
            }
            return txt;
          }

          // ── GERADOR: estado ──────────────────────────────────────
          function genMonsterToDiscord(gm) {
            const div = '───────────────────────────────────';
            let txt = `**${(gm.nome||'MONSTRO GERADO').toUpperCase()}**\n`;
            txt += `*${gm.tipo||'Besta Média, Neutro'}*\n`;
            txt += `${div}\n`;
            txt += `**CA:** ${gm.ca||'—'}  |  **PV:** ${gm.pv||'—'}  |  **Desl.:** ${gm.desl||'9m'}`;
            if (gm.reacoes) txt += `  |  **Reações:** ${gm.reacoes}`;
            txt += `\n${div}\n`;
            txt += `\`\`\`\n| FOR        | DES        | CON        | INT        | SAB        | CAR        |\n`;
            txt += `|------------|------------|------------|------------|------------|------------|\n`;
            txt += `| ${(gm.for||'10 (+0)').padEnd(10)} | ${(gm.des||'10 (+0)').padEnd(10)} | ${(gm.con||'10 (+0)').padEnd(10)} | ${(gm.int||'10 (+0)').padEnd(10)} | ${(gm.sab||'10 (+0)').padEnd(10)} | ${(gm.car||'10 (+0)').padEnd(10)} |\n\`\`\`\n`;
            if (gm.pericias)         txt += `**Perícias:** ${gm.pericias}\n`;
            if (gm.trs)              txt += `**TRs:** ${gm.trs}\n`;
            if (gm.imunidades)       txt += `**Imunidades:** ${gm.imunidades}\n`;
            if (gm.resistencias)     txt += `**Resistências:** ${gm.resistencias}\n`;
            if (gm.vulnerabilidades) txt += `**Vulnerabilidades:** ${gm.vulnerabilidades}\n`;
            if (gm.sentidos)         txt += `**Sentidos:** ${gm.sentidos}\n`;
            if (gm.lingua)           txt += `**Língua:** ${gm.lingua}\n`;
            if (gm.tracos && gm.tracos.trim()) {
              txt += `${div}\n**Traços Especiais**\n`;
              gm.tracos.split('\n').filter(l=>l.trim()).forEach(l => { txt += `▸ ${l.trim()}\n`; });
            }
            if (gm.acoes && gm.acoes.trim()) {
              txt += `${div}\n**Ações**\n`;
              gm.acoes.split('\n').filter(l=>l.trim()).forEach(l => { txt += `▸ ${l.trim()}\n`; });
            }
            return txt;
          }

          const monsters = filteredMonsters();
          const sel = S.bestiarioSelectedMonster;
          const gm  = S.bestiarioGenMonster || {};

          // ── HTML ─────────────────────────────────────────────────
          container.innerHTML = `
<div class="custom-scrollbar" style="flex:1;overflow-y:auto;background:#0a0a0a;font-family:'Rajdhani',sans-serif;color:#e2e8f0">
<div style="padding:8px 8px 40px 8px">
  <!-- HEADER -->
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
    <button onclick="state.view='LIST';render()" style="background:#ffffff15;border:1px solid #ffffff20;border-radius:8px;color:#94a3b8;padding:6px 10px;cursor:pointer;font-size:12px">← Voltar</button>
    <div style="flex:1">
      <div style="font-family:'Orbitron',sans-serif;font-size:16px;font-weight:900;color:#f97316;letter-spacing:.1em">🐉 BESTIÁRIO</div>
      <div style="font-size:10px;color:#64748b;letter-spacing:.06em">MESTRE / ADMIN — HxH5e RPG 2.0</div>
    </div>
    <div style="background:#f9731620;border:1px solid #f9731640;border-radius:8px;padding:4px 8px;font-size:10px;color:#fb923c;font-weight:700">${window.BESTIARY_DATA.length} Criaturas</div>
  </div>

  <!-- TABS -->
  <div style="display:flex;gap:6px;margin-bottom:12px">
    ${['LISTA','GERAR'].map(t=>`
      <button onclick="state.bestiarioTab='${t}';state.bestiarioSelectedMonster=null;render()"
        style="flex:1;padding:8px;border-radius:8px;font-family:'Orbitron',sans-serif;font-size:10px;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:all .2s;
          ${tab===t ? 'background:#f9731630;border:1px solid #f97316;color:#fb923c' : 'background:#ffffff08;border:1px solid #ffffff15;color:#64748b'}">
        ${t==='LISTA' ? '📖‹ LISTA' : '⚡ GERAR'}
      </button>`).join('')}
  </div>

  ${tab === 'LISTA' ? `
  <!-- SEARCH -->
  <div style="position:relative;margin-bottom:8px">
    <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#64748b;font-size:14px">🔍</span>
    <input type="text" placeholder="Buscar criatura..." value="${(S.bestiarioSearch||'').replace(/"/g,'&quot;')}"
      oninput="state.bestiarioSearch=this.value;render()"
      style="width:100%;padding:8px 8px 8px 32px;background:#ffffff08;border:1px solid #ffffff15;border-radius:10px;color:#e2e8f0;font-size:13px;outline:none;box-sizing:border-box"/>
  </div>

  <!-- FILTERS -->
  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:12px">
    ${CATS.map(c=>`
      <button onclick="state.bestiarioFilter='${c}';render()"
        style="padding:3px 8px;border-radius:6px;font-size:9px;font-weight:700;cursor:pointer;letter-spacing:.04em;
          ${filter===c ? `background:${CAT_COLOR[c]||'#f97316'}30;border:1px solid ${CAT_COLOR[c]||'#f97316'};color:${CAT_COLOR[c]||'#fb923c'}` : 'background:#ffffff08;border:1px solid #ffffff15;color:#64748b'}">
        ${c}
      </button>`).join('')}
  </div>

  <!-- MONSTER LIST -->
  <div style="display:flex;flex-direction:column;gap:6px">
    ${monsters.length === 0 ? `<div style="text-align:center;padding:32px;color:#475569;font-size:13px">Nenhuma criatura encontrada</div>` :
      monsters.map((m,i) => {
        const cc = CAT_COLOR[m.cat]||'#94a3b8';
        return `
        <div onclick="state.bestiarioSelectedMonster=${JSON.stringify(m).replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')};render()"
          style="background:#ffffff05;border:1px solid #ffffff12;border-radius:10px;padding:10px 12px;cursor:pointer;transition:all .2s;border-left:3px solid ${cc}">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div style="font-weight:700;font-size:14px;color:#f1f5f9">${m.nome}</div>
            <span style="background:${cc}22;border:1px solid ${cc}55;border-radius:4px;padding:1px 5px;font-size:8px;font-weight:700;color:${cc}">${m.cat}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:2px">${m.tipo}</div>
          <div style="display:flex;gap:8px;margin-top:4px;font-size:10px;color:#94a3b8">
            <span>🛡️ ${m.ca.split(' ')[0]}</span>
            <span>❤ ${m.pv.split(' ')[0]}</span>
            <span>🏃 ${m.desl}</span>
          </div>
        </div>`;
      }).join('')}
  </div>

  ` : `
  <!-- GERAR MONSTRO -->
  <div style="display:flex;flex-direction:column;gap:10px">
    <div style="background:#f9731610;border:1px solid #f9731630;border-radius:10px;padding:10px;font-size:11px;color:#fb923c;line-height:1.5">
      ⚡ Crie um novo monstro seguindo as regras do livro. Preencha os campos abaixo e copie a ficha gerada para o Discord.
    </div>

    ${[
      ['nome','Nome da Criatura','text','ex: Corvo das Trevas'],
      ['tipo','Tipo / Tamanho / Alinhamento','text','ex: Besta Mágica Grande, Maligno'],
      ['ca','Classe de Armadura','text','ex: 15 (Defesa Natural)'],
      ['pv','Pontos de Vida','text','ex: 45 (4d10+3)'],
      ['desl','Deslocamento','text','ex: 9m / 12m Voo'],
      ['reacoes','Reações (opcional)','text','ex: 4'],
    ].map(([fld,lbl,type,ph])=>`
      <div>
        <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;font-weight:700">${lbl}</div>
        <input type="${type}" placeholder="${ph}" value="${(gm[fld]||'').toString().replace(/"/g,'&quot;')}"
          oninput="state.bestiarioGenMonster=Object.assign({},state.bestiarioGenMonster||{},{${fld}:this.value});document.getElementById('bgen-preview').textContent=window._bgenPreview();"
          style="width:100%;padding:8px;background:#ffffff08;border:1px solid #ffffff15;border-radius:8px;color:#e2e8f0;font-size:12px;outline:none;box-sizing:border-box"/>
      </div>`).join('')}

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">
      ${['for','des','con','int','sab','car'].map(a=>`
        <div>
          <div style="font-size:9px;color:#94a3b8;margin-bottom:3px;font-weight:700;text-align:center">${a.toUpperCase()}</div>
          <input type="text" placeholder="10 (+0)" value="${(gm[a]||'').replace(/"/g,'&quot;')}"
            oninput="state.bestiarioGenMonster=Object.assign({},state.bestiarioGenMonster||{},{${a}:this.value});document.getElementById('bgen-preview').textContent=window._bgenPreview();"
            style="width:100%;padding:6px;background:#ffffff08;border:1px solid #ffffff15;border-radius:6px;color:#e2e8f0;font-size:11px;text-align:center;outline:none;box-sizing:border-box"/>
        </div>`).join('')}
    </div>

    ${[
      ['pericias','Perícias','ex: Furtividade +5, Percepção +3'],
      ['trs','Testes de Resistência','ex: For +6, Con +4'],
      ['imunidades','Imunidades','ex: Veneno, Caído'],
      ['resistencias','Resistências','ex: Cortante, Perfurante'],
      ['vulnerabilidades','Vulnerabilidades','ex: Fogo'],
      ['sentidos','Sentidos','ex: Visão no Escuro 18m'],
      ['lingua','Língua','ex: Comum'],
    ].map(([fld,lbl,ph])=>`
      <div>
        <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;font-weight:700">${lbl}</div>
        <input type="text" placeholder="${ph}" value="${(gm[fld]||'').replace(/"/g,'&quot;')}"
          oninput="state.bestiarioGenMonster=Object.assign({},state.bestiarioGenMonster||{},{'${fld}':this.value});document.getElementById('bgen-preview').textContent=window._bgenPreview();"
          style="width:100%;padding:7px;background:#ffffff08;border:1px solid #ffffff15;border-radius:8px;color:#e2e8f0;font-size:12px;outline:none;box-sizing:border-box"/>
      </div>`).join('')}

    <div>
      <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;font-weight:700">Traços Especiais (um por linha)</div>
      <textarea placeholder="Nome do Traço: Descrição do traço especial..." rows="4"
        oninput="state.bestiarioGenMonster=Object.assign({},state.bestiarioGenMonster||{},{tracos:this.value});document.getElementById('bgen-preview').textContent=window._bgenPreview();"
        style="width:100%;padding:8px;background:#ffffff08;border:1px solid #ffffff15;border-radius:8px;color:#e2e8f0;font-size:12px;outline:none;resize:vertical;box-sizing:border-box">${gm.tracos||''}</textarea>
    </div>

    <div>
      <div style="font-size:10px;color:#94a3b8;margin-bottom:4px;font-weight:700">Ações (uma por linha)</div>
      <textarea placeholder="Nome da Ação: Descrição da ação..." rows="4"
        oninput="state.bestiarioGenMonster=Object.assign({},state.bestiarioGenMonster||{},{acoes:this.value});document.getElementById('bgen-preview').textContent=window._bgenPreview();"
        style="width:100%;padding:8px;background:#ffffff08;border:1px solid #ffffff15;border-radius:8px;color:#e2e8f0;font-size:12px;outline:none;resize:vertical;box-sizing:border-box">${gm.acoes||''}</textarea>
    </div>

    <!-- PREVIEW + COPY -->
    <div style="background:#0d0d0d;border:1px solid #f9731630;border-radius:10px;padding:10px">
      <div style="font-size:10px;color:#f97316;font-weight:700;margin-bottom:6px;letter-spacing:.06em">📖‹ PREVIEW DISCORD</div>
      <pre id="bgen-preview" style="font-size:10px;color:#94a3b8;white-space:pre-wrap;word-break:break-word;margin:0;max-height:200px;overflow-y:auto">${genMonsterToDiscord(gm)}</pre>
    </div>

    <button onclick="
      const txt = document.getElementById('bgen-preview').textContent;
      navigator.clipboard.writeText(txt).then(()=>{
        this.textContent='✓ Copiado!';
        setTimeout(()=>this.textContent='📖‹ Copiar para Discord',2000);
      }).catch(()=>{
        this.textContent='⚠ Use Ctrl+C acima';
        setTimeout(()=>this.textContent='📖‹ Copiar para Discord',2000);
      });"
      style="width:100%;padding:10px;background:#f9731620;border:1px solid #f97316;border-radius:10px;color:#fb923c;font-family:'Orbitron',sans-serif;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:.06em">
      📖‹ Copiar para Discord
    </button>

    <button onclick="state.bestiarioGenMonster={};render()"
      style="width:100%;padding:8px;background:#ffffff08;border:1px solid #ffffff15;border-radius:8px;color:#64748b;font-size:12px;cursor:pointer">
      🗑️ Limpar Formulário
    </button>
  </div>
  `}
</div>
</div>`;

          // ── MODAL DETALHE ─────────────────────────────────────────
          if (sel && tab === 'LISTA') {
            const m = typeof sel === 'string' ? JSON.parse(sel) : sel;
            const cc = CAT_COLOR[m.cat]||'#94a3b8';
            const discordTxt = monsterToDiscord(m);

            // ── Parseia ataques da lista de ações ─────────────────
            const parsedAtks = (m.acoes||[]).map(a => {
              const atkM = a.d.match(/[+\-](\d+) para (atingir|acertar)/i);
              const dmgM = a.d.match(/\((\d+d\d+(?:[+\-]\d+)?)\)/);
              if (!atkM || !dmgM) return null;
              // extrai tipo de dano (palavra após o ')' )
              const tipoM = a.d.match(/\)\s+([a-záéíóúàãõâêîôûçA-Z]+)/);
              return { nome: a.n, atk: parseInt(atkM[1]), dmg: dmgM[1], tipo: tipoM ? tipoM[1] : 'dano' };
            }).filter(Boolean);

            // Função de rolagem exposta globalmente
            window._rollBestiaryAtk = function(monsterName, atkName, atkBonus, dmgExpr, dmgTipo) {
              const d20 = Math.floor(Math.random()*20)+1;
              const isCrit = d20===20, isFumble = d20===1;
              const atkTotal = d20 + atkBonus;

              // Rolar dano
              const dmgParts = dmgExpr.match(/^(\d+)d(\d+)(?:([+\-])(\d+))?$/);
              let dmgRolls = [], dmgTotal = 0;
              if (dmgParts) {
                const n=parseInt(dmgParts[1]), d=parseInt(dmgParts[2]);
                dmgRolls = Array.from({length:isCrit?n*2:n}, ()=>Math.floor(Math.random()*d)+1);
                dmgTotal = dmgRolls.reduce((a,b)=>a+b,0);
                if (dmgParts[3]) dmgTotal += dmgParts[3]==='+'?parseInt(dmgParts[4]):-parseInt(dmgParts[4]);
              }

              const critFlag = isCrit ? '  🎯 **CRÍTICO!**' : isFumble ? '  🧨 *Erro Grave*' : '';
              const critLabel = isCrit ? ' (CRÍTICO — dados dobrados)' : '';
              const bonusStr = atkBonus >= 0 ? `+${atkBonus}` : `${atkBonus}`;
              const dmgBonusStr = dmgParts && dmgParts[3] ? ` ${dmgParts[3]}${dmgParts[4]}` : '';
              const content =
                ` 🐲 **${monsterName}** — **${atkName}**\n` +
                `² Ataque: [d20: **${d20}**] ${bonusStr} = **${atkTotal}**${critFlag}\n` +
                ` ⚔️ Dano: [${dmgRolls.join(' + ')}]${dmgBonusStr} = **${dmgTotal}** ${dmgTipo}${critLabel}`;

              const whUrl = typeof getActiveWebhookUrl==='function' ? getActiveWebhookUrl() : null;
              if (!whUrl) { alert('Nenhum webhook configurado.\nVá em Admin > Webhooks.'); return; }

              const btn = event.currentTarget;
              const orig = btn.textContent;
              btn.textContent = '⏳';
              fetch(whUrl, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content})})
                .then(()=>{ btn.textContent='✓'; setTimeout(()=>btn.textContent=orig, 1800); })
                .catch(()=>{ btn.textContent='⚠'; setTimeout(()=>btn.textContent=orig, 1800); });
            };

            // limpa modal anterior se existir
            const _oldMod = document.getElementById('bestiary-modal');
            if (_oldMod) _oldMod.remove();

            const modal = document.createElement('div');
            modal.id = 'bestiary-modal';
            modal.style.cssText = 'position:fixed;inset:0;background:#000000cc;z-index:9999;overflow-y:auto;padding:16px;';
            modal.innerHTML = `
<div style="max-width:480px;margin:0 auto;background:#0f0f0f;border:1px solid ${cc}55;border-radius:16px;overflow:hidden;padding-bottom:16px">
  <!-- Modal Header -->
  <div style="background:${cc}18;padding:14px 16px;border-bottom:1px solid ${cc}30">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
      <div style="flex:1">
        <div style="font-family:'Orbitron',sans-serif;font-size:14px;font-weight:900;color:#f1f5f9;line-height:1.2">${m.nome}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;font-style:italic">${m.tipo}</div>
      </div>
      <button onclick="state.bestiarioSelectedMonster=null;const _m=document.getElementById('bestiary-modal');if(_m)_m.remove();"
        style="background:#ffffff15;border:1px solid #ffffff20;border-radius:8px;color:#94a3b8;padding:6px 10px;cursor:pointer;font-size:16px;flex-shrink:0;line-height:1">✕</button>
    </div>
    <span style="display:inline-block;background:${cc}22;border:1px solid ${cc}55;border-radius:4px;padding:1px 6px;font-size:8px;font-weight:700;color:${cc};margin-top:6px">${m.cat}</span>
  </div>

  <!-- Combate -->
  <div style="padding:12px 16px;border-bottom:1px solid #ffffff10">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;text-align:center">
      ${[['🛡️ CA',m.ca],['❤ PV',m.pv],['🏃 Deslocamento',m.desl]].map(([l,v])=>`
        <div style="background:#ffffff08;border-radius:8px;padding:6px">
          <div style="font-size:9px;color:#64748b">${l}</div>
          <div style="font-size:11px;font-weight:700;color:#e2e8f0;margin-top:2px">${v}</div>
        </div>`).join('')}
    </div>
    ${m.reacoes ? `<div style="text-align:center;margin-top:6px;font-size:11px;color:#94a3b8">⚡ <strong style="color:#fbbf24">${m.reacoes}</strong> Reações</div>` : ''}
  </div>

  <!-- Atributos -->
  ${m.for !== '—' ? `<div style="padding:10px 16px;border-bottom:1px solid #ffffff10">
    <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;text-align:center">
      ${['FOR','DES','CON','INT','SAB','CAR'].map((a,i)=>`
        <div style="background:#ffffff08;border-radius:6px;padding:5px 2px">
          <div style="font-size:8px;color:#64748b">${a}</div>
          <div style="font-size:11px;font-weight:700;color:#e2e8f0">${[m.for,m.des,m.con,m.int,m.sab,m.car][i]}</div>
        </div>`).join('')}
    </div>
  </div>` : ''}

  <!-- Info -->
  <div style="padding:10px 16px;font-size:11px;line-height:1.7;border-bottom:1px solid #ffffff10;display:flex;flex-direction:column;gap:2px">
    ${m.pericias ? `<div><span style="color:#64748b">Perícias:</span> <span style="color:#cbd5e1">${m.pericias}</span></div>` : ''}
    ${m.trs ? `<div><span style="color:#64748b">TRs:</span> <span style="color:#cbd5e1">${m.trs}</span></div>` : ''}
    ${m.imunidades ? `<div><span style="color:#64748b">Imunidades:</span> <span style="color:#a3e635">${m.imunidades}</span></div>` : ''}
    ${m.resistencias ? `<div><span style="color:#64748b">Resistências:</span> <span style="color:#60a5fa">${m.resistencias}</span></div>` : ''}
    ${m.vulnerabilidades ? `<div><span style="color:#64748b">Vulnerabilidades:</span> <span style="color:#f87171">${m.vulnerabilidades}</span></div>` : ''}
    ${m.sentidos ? `<div><span style="color:#64748b">Sentidos:</span> <span style="color:#cbd5e1">${m.sentidos}</span></div>` : ''}
    ${m.lingua ? `<div><span style="color:#64748b">Língua:</span> <span style="color:#cbd5e1">${m.lingua}</span></div>` : ''}
  </div>

  <!-- Traços -->
  ${m.tracos && m.tracos.length ? `
  <div style="padding:10px 16px;border-bottom:1px solid #ffffff10">
    <div style="font-size:10px;color:#a78bfa;font-weight:700;margin-bottom:6px;letter-spacing:.05em">TRAÇOS ESPECIAIS</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${m.tracos.map(t=>`
        <div style="background:#a78bfa12;border-left:2px solid #a78bfa;border-radius:0 6px 6px 0;padding:6px 8px;font-size:11px;line-height:1.5">
          <span style="color:#c4b5fd;font-weight:700">${t.n}.</span> <span style="color:#cbd5e1">${t.d}</span>
        </div>`).join('')}
    </div>
  </div>` : ''}

  <!-- Ações -->
  ${m.acoes && m.acoes.length ? `
  <div style="padding:10px 16px;border-bottom:1px solid #ffffff10">
    <div style="font-size:10px;color:#fb923c;font-weight:700;margin-bottom:6px;letter-spacing:.05em">AÇÕES</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${m.acoes.map(a=>`
        <div style="background:#f9731612;border-left:2px solid #f97316;border-radius:0 6px 6px 0;padding:6px 8px;font-size:11px;line-height:1.5">
          <span style="color:#fb923c;font-weight:700">${a.n}.</span> <span style="color:#cbd5e1">${a.d}</span>
        </div>`).join('')}
    </div>
  </div>` : ''}

  <!-- Rolar Ataques -->
  ${parsedAtks.length ? `
  <div style="padding:12px 16px;border-top:1px solid #ffffff10">
    <button onclick="const p=this.nextElementSibling;p.style.display=p.style.display==='none'?'flex':'none';this.textContent=p.style.display==='none'?'🎲 Rolar Ataques ▼':'🎲 Rolar Ataques ▲';"
      style="width:100%;padding:10px;background:#16a34a20;border:1px solid #16a34a;border-radius:10px;color:#4ade80;font-family:'Orbitron',sans-serif;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:.06em">
      🎲 Rolar Ataques ▼
    </button>
    <div style="display:none;flex-direction:column;gap:6px;margin-top:8px">
      ${parsedAtks.map(a=>`
      <div style="background:#16a34a10;border:1px solid #16a34a30;border-radius:10px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:700;color:#f1f5f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.nome}</div>
          <div style="font-size:10px;color:#64748b;margin-top:2px">
            <span style="color:#fbbf24">+${a.atk}</span> para atingir &nbsp;•&nbsp; <span style="color:#f87171">${a.dmg}</span> ${a.tipo}
          </div>
        </div>
        <button onclick="window._rollBestiaryAtk('${m.nome.replace(/'/g,"\\'").replace(/`/g,'\\`')}','${a.nome.replace(/'/g,"\\'").replace(/`/g,'\\`')}',${a.atk},'${a.dmg}','${a.tipo}')"
          style="flex-shrink:0;padding:8px 14px;background:#16a34a30;border:1px solid #22c55e;border-radius:8px;color:#4ade80;font-family:'Orbitron',sans-serif;font-size:10px;font-weight:700;cursor:pointer;letter-spacing:.05em;white-space:nowrap">
          🎲 Rolar
        </button>
      </div>`).join('')}
    </div>
  </div>` : ''}

  <!-- Enviar -->
  <div style="padding:12px 16px">
    <button id="bst-send-btn-${m.nome.replace(/\s/g,'_')}"
      onclick="(function(){
        const txt = \`${discordTxt.replace(/`/g,'\\`').replace(/\$/g,'\\$')}\`;
        const whUrl = typeof getActiveWebhookUrl === 'function' ? getActiveWebhookUrl() : null;
        if (!whUrl) { alert('Nenhum webhook configurado. Vá em Admin > Webhooks.'); return; }
        const btn = document.getElementById('bst-send-btn-${m.nome.replace(/\s/g,'_')}');
        if (btn) btn.textContent = '⏳ Enviando...';
        const chunks = [];
        let remaining = txt;
        while (remaining.length > 0) { chunks.push(remaining.slice(0,1950)); remaining = remaining.slice(1950); }
        const sendNext = (i) => {
          if (i >= chunks.length) {
            if (btn) { btn.textContent = '✓ Enviado!'; setTimeout(()=>btn.textContent='📖‹ Enviar Ficha no Discord',2500); }
            return;
          }
          fetch(whUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({content:chunks[i]}) })
            .then(()=>sendNext(i+1))
            .catch(()=>{ if(btn){btn.textContent='⚠ Erro ao enviar';setTimeout(()=>btn.textContent='📖‹ Enviar Ficha no Discord',2500);} });
        };
        sendNext(0);
      })()"
      style="width:100%;padding:11px;background:#5865f220;border:1px solid #5865f2;border-radius:10px;color:#818cf8;font-family:'Orbitron',sans-serif;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:.06em">
      📖‹ Enviar Ficha no Discord
    </button>
    <div style="background:#0d0d0d;border:1px solid #ffffff12;border-radius:8px;padding:8px;margin-top:8px;max-height:280px;overflow-y:auto">
      <div style="font-size:9px;color:#64748b;margin-bottom:4px;font-weight:700;letter-spacing:.04em">PRÉVIA — role para ver tudo</div>
      <pre style="font-size:9px;color:#94a3b8;white-space:pre-wrap;word-break:break-word;margin:0;line-height:1.5">${discordTxt.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    </div>
  </div>
</div>`;

            document.body.appendChild(modal);
            modal.addEventListener('click', e => {
              if (e.target === modal) {
                state.bestiarioSelectedMonster = null;
                modal.remove();
              }
            });
          }

          // Helper para preview do gerador
          window._bgenPreview = function() {
            return genMonsterToDiscord(state.bestiarioGenMonster || {});
          };

          if (window.lucide) lucide.createIcons();
        };
