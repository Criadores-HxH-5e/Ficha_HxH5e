// ══════════════════════════════════════════════════════════
//  SUPABASE — armazenamento central
// ══════════════════════════════════════════════════════════
const SUPABASE_URL = 'https://qbppvrsevwucrbrtdonx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFicHB2cnNldnd1Y3JicnRkb254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA3OTgsImV4cCI6MjA5MTI5Njc5OH0.HCLqFi7jTrRpNZymWjGs-O2L3uPjWHGzD2Z2k2Dce-M';

function sbH(extra) {
    return Object.assign({ 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }, extra || {});
}
async function sbSelect(table, query) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query || ''}`, { headers: sbH() });
        return res.ok ? res.json() : null;
    } catch { return null; }
}
async function sbUpsert(table, data) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: sbH({ 'Prefer': 'resolution=merge-duplicates' }),
            body: JSON.stringify(data)
        });
        return res.ok;
    } catch { return false; }
}
async function sbDelete(table, query) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { method: 'DELETE', headers: sbH() });
        return res.ok;
    } catch { return false; }
}

// Sincroniza fichas do Supabase para o localStorage
async function syncFromCloud() {
    if (!state.user) return;
    const data = await sbSelect('characters', `user_id=eq.${state.user.id}&select=data,last_mod`);
    if (!data || !data.length) return;
    data.forEach(row => {
        const rc = row.data;
        if (!rc || !rc.id) return;
        rc.userId = state.user.id;
        const localKey = 'hxhrpg_' + rc.id;
        const localRaw = localStorage.getItem(localKey);
        if (!localRaw) {
            localStorage.setItem(localKey, JSON.stringify(rc));
        } else {
            try {
                const lc = JSON.parse(localRaw);
                if (new Date(rc.lastMod || 0) > new Date(lc.lastMod || 0))
                    localStorage.setItem(localKey, JSON.stringify(rc));
            } catch { localStorage.setItem(localKey, JSON.stringify(rc)); }
        }
    });
}

// Salva imediatamente no Supabase (sem debounce)
async function saveToCloudNow() {
    if (!state.user) return;
    const chars = state.characters || [];
    for (const char of chars) {
        if (!char || !char.id) continue;
        await sbUpsert('characters', { id: char.id, user_id: state.user.id, data: char, last_mod: char.lastMod || new Date().toISOString() });
    }
}

// Salva no Supabase (debounced 2s)
let _cloudSaveTimer = null;
async function saveToCloud() {
    if (!state.user) return;
    clearTimeout(_cloudSaveTimer);
    _cloudSaveTimer = setTimeout(saveToCloudNow, 2000);
}

function loadCharacters() {
    const chars = [];
    const currentUserId = state.user ? state.user.id : '000000';
    for(let i=0; i<localStorage.length; i++) {
        const key = localStorage.key(i);
        if(key && key.startsWith('hxhrpg_') && !key.startsWith('hxhrpg_cloud')) {
            try {
                const char = JSON.parse(localStorage.getItem(key));
                if ((char.userId || '000000') !== currentUserId) continue;
                // Migrate TRANSFORMAÇÃO → TRANSMUTAÇÃO (typo fix)
                if (char.class === 'TRANSFORMAÇÃO') {
                    char.class = 'TRANSMUTAÇÃO';
                    localStorage.setItem(key, JSON.stringify(char));
                }
                if (char.attributes && char.attributes.CAR !== undefined && char.attributes.PRE === undefined) {
                    char.attributes.PRE = char.attributes.CAR;
                    delete char.attributes.CAR;
                    if (char.skills) char.skills = char.skills.map(s => s === 'TR de CAR' ? 'TR de PRE' : s);
                    if (char.expertise) char.expertise = char.expertise.map(s => s === 'TR de CAR' ? 'TR de PRE' : s);
                    localStorage.setItem(key, JSON.stringify(char));
                }
                chars.push(char);
            } catch(e) {}
        }
    }
    state.characters = chars.sort((a,b) => new Date(b.lastMod) - new Date(a.lastMod));
}

function saveCharacter(char) {
    char.lastMod = new Date().toISOString();
    if (state._viewingMode && state.viewingUser) {
        saveViewingChar(char);
        return;
    }
    char.userId = state.user ? state.user.id : '000000';
    localStorage.setItem('hxhrpg_' + char.id, JSON.stringify(char));
    loadCharacters();
    if (state.user) sbUpsert('characters', { id: char.id, user_id: state.user.id, data: char, last_mod: char.lastMod });
}

function deleteCharacter(id) {
    if (state._viewingMode) return;
    const char = (state.characters || []).find(c => c.id === id);
    const nome = (char && char.name) || 'esta ficha';

    document.getElementById('delete-char-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'delete-char-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:#000000cc;display:flex;align-items:center;justify-content:center;z-index:9999;padding:24px;font-family:Rajdhani,sans-serif';
    overlay.innerHTML = `
        <div style="background:#0d1117;border:2px solid #ef4444;border-radius:16px;padding:24px;width:100%;max-width:380px;box-shadow:0 0 40px #ef444433">
            <div style="font-family:Orbitron,sans-serif;font-weight:900;font-size:13px;color:#ef4444;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">⚠️ Apagar Ficha</div>
            <div style="font-size:12px;color:#9ca3af;margin-bottom:16px;line-height:1.5">
                Esta ação é <span style="color:#ef4444;font-weight:700">irreversível</span>. Para confirmar, digite o nome do personagem abaixo:
            </div>
            <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Nome do Personagem</div>
            <div style="background:#111827;border:1px solid #374151;border-radius:8px;padding:8px 12px;margin-bottom:6px;font-family:Orbitron,sans-serif;font-size:13px;color:#fbbf24;letter-spacing:1px">${nome}</div>
            <input id="delete-char-confirm-input" type="text" placeholder="Digite o nome aqui..." autocomplete="off"
                style="width:100%;box-sizing:border-box;background:#0a0a0f;border:2px solid #374151;border-radius:8px;padding:10px 12px;color:#fff;font-size:13px;font-family:Rajdhani,sans-serif;outline:none;margin-bottom:16px;transition:border-color .2s"
                oninput="
                    const v = this.value;
                    const match = v.trim().toLowerCase() === '${nome.replace(/'/g, "\\'").toLowerCase()}';
                    this.style.borderColor = v.length === 0 ? '#374151' : match ? '#22c55e' : '#ef4444';
                    document.getElementById('delete-char-confirm-btn').disabled = !match;
                    document.getElementById('delete-char-confirm-btn').style.opacity = match ? '1' : '0.4';
                    document.getElementById('delete-char-confirm-btn').style.cursor = match ? 'pointer' : 'not-allowed';
                "
                onkeydown="if(event.key==='Escape') document.getElementById('delete-char-overlay').remove();"
            >
            <div style="display:flex;gap:10px">
                <button onclick="document.getElementById('delete-char-overlay').remove()"
                    style="flex:1;padding:11px;border-radius:10px;background:#1f2937;border:1px solid #374151;color:#9ca3af;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;cursor:pointer;letter-spacing:1px">
                    Cancelar
                </button>
                <button id="delete-char-confirm-btn" disabled onclick="window._confirmDeleteCharacter('${id}','${nome.replace(/'/g,"\\'")}')"
                    style="flex:1;padding:11px;border-radius:10px;background:#7f1d1d;border:1px solid #ef4444;color:#f87171;font-family:Orbitron,sans-serif;font-weight:900;font-size:10px;text-transform:uppercase;letter-spacing:1px;opacity:0.4;cursor:not-allowed">
                    🗑️ Apagar
                </button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => { const inp = document.getElementById('delete-char-confirm-input'); if (inp) inp.focus(); }, 50);
}

window._confirmDeleteCharacter = function(id, nome) {
    document.getElementById('delete-char-overlay')?.remove();
    localStorage.removeItem('hxhrpg_' + id);
    if (state.user) sbDelete('characters', `id=eq.${id}`);
    loadCharacters();
    if (state.currentChar && state.currentChar.id === id) {
        state.view = 'LIST';
        state.currentChar = null;
    }
    render();
    if (window._showXpToast) window._showXpToast(`🗑️ "${nome}" foi apagado.`);
};

// --- UTILITÁRIOS ---
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2); }
function getMod(val) { return val ? Math.floor((val - 10) / 2) : 0; }
function getModStr(val) { const m = getMod(val); return m >= 0 ? `+${m}` : `${m}`; }
function getPointBuyCost(val) { return SYSTEM_DB.pointBuyCosts[val] !== undefined ? SYSTEM_DB.pointBuyCosts[val] : 0; }
function getProficiencyBonus(level) { return Math.max(2, Math.floor((level - 1) / 4) + 2); }

function calculateTotalCost(attrs) {
    let total = 0;
    Object.values(attrs).forEach(val => { total += getPointBuyCost(val); });
    return total;
}

function setThemeColor(hex) {
    document.documentElement.style.setProperty('--theme-color-hex', hex);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if(result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        document.documentElement.style.setProperty('--theme-rgb', `${r}, ${g}, ${b}`);
    }
}

function getNenPercentages(selectedId) {
    const types = ['INTENSIFICAÇÃO', 'TRANSMUTAÇÃO', 'MATERIALIZAÇÃO', 'ESPECIALIZAÇÃO', 'MANIPULAÇÃO', 'EMISSÃO'];
    const selectedIndex = types.indexOf(selectedId);
    const matrix = {};
    types.forEach((type, index) => {
        let diff = Math.abs(index - selectedIndex);
        if (diff > 3) diff = 6 - diff;
        let pct = 0;
        if (diff === 0) pct = 100; else if (diff === 1) pct = 80; else if (diff === 2) pct = 60; else if (diff === 3) pct = 40;
        if (type === 'ESPECIALIZAÇÃO' && diff !== 0) {
            pct = 0;
            if (selectedId === 'MATERIALIZAÇÃO' || selectedId === 'MANIPULAÇÃO') pct = 1;
        }
        matrix[type] = pct;
    });
    return matrix;
}

// --- DRAG AND DROP HANDLERS ---
window.handleDragStart = (e, idx) => {
    state.draggedPoolIdx = idx;
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
};

window.handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
};

window.handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drop-zone-active');
};

window.handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drop-zone-active');
};

window.handleDrop = (e, attr) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-zone-active');
    if (state.draggedPoolIdx !== null) {
        state.selectedPoolIdx = state.draggedPoolIdx;
        assignToSlot(attr);
        state.draggedPoolIdx = null;
    }
};

// --- HELPER DE BÔNUS RACIAL ---
function getBonusRequirements(raceName) {
    const r = SYSTEM_DB.racas.find(x => x.nome === raceName);
    if (!r) return null;

    if (r.aumento_atributo === "Distribua 3 pontos em qualquer atributo") {
        return { type: 'wildcard', amount: 3 };
    }
    if (r.aumento_atributo === "Escolha +2") {
        return { type: 'wildcard', amount: 2 };
    }
    if (typeof r.aumento_atributo === 'object') {
        if (r.aumento_atributo.INT_ou_SAB) {
            return { type: 'choice', keys: ['INT', 'SAB'], amount: r.aumento_atributo.INT_ou_SAB };
        }
        if (r.aumento_atributo.Físico) {
            return { type: 'choice', keys: ['FOR', 'DES', 'CON'], amount: r.aumento_atributo.Físico };
        }
    }
    return null;
}

function getAllocatedTotal() {
    return Object.values(state.allocations).reduce((a, b) => a + b, 0);
}

function updateAllocation(attr, delta, limit) {
    const current = state.allocations[attr] || 0;
    const total = getAllocatedTotal();
    if (delta > 0 && total >= limit) return;
    if (delta < 0 && current <= 0) return;
    state.allocations[attr] = current + delta;
    render(true);
}

function updateChoiceAllocation(attr, amount) {
    state.allocations = { [attr]: amount };
    render(true);
}

// --- HEXÁGONO DE NEN ---
function renderNenHexagon(selectedId, interactive) {
    const percentages = getNenPercentages(selectedId);
    const currentClass = SYSTEM_DB.classes.find(c => c.id === selectedId);
    const color = currentClass ? currentClass.color : '#00ff9d';

    const center = {x: 50, y: 50};
    const points = SYSTEM_DB.classes.map(c => {
        const rad = (c.angle * Math.PI) / 180;
        const r = 35;
        return {
            id: c.id,
            x: 50 + (r * Math.cos(rad)),
            y: 50 + (r * Math.sin(rad))
        };
    });

    const selPoint = points.find(p => p.id === selectedId);
    const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    const nodesHtml = SYSTEM_DB.classes.map(c => {
        const pct = percentages[c.id];
        const isSelected = c.id === selectedId;
        const rad = (c.angle * Math.PI) / 180;
        const top = 50 + (35 * Math.sin(rad));
        const left = 50 + (35 * Math.cos(rad));

        let nodeContent = '';
        let borderStyle = '';

        if (isSelected) {
            borderStyle = `border-color: ${c.color}; background-color: ${c.color}20; box-shadow: 0 0 15px ${c.color}; transform: scale(1.2);`;
            nodeContent = `<span class="font-display font-black text-xs text-white drop-shadow-md">${pct}%</span>`;
        } else {
            const opacity = pct === 0 ? 0.2 : (pct / 100);
            borderStyle = `border-color: ${c.color}; opacity: ${0.5 + (opacity/2)}; transform: scale(${0.8 + (opacity * 0.2)});`;
            nodeContent = `<span class="font-display font-bold text-[10px]" style="color:${c.color}">${pct}%</span>`;
        }

        const clickAttr = interactive ? `onclick="selectNenType('${c.id}')"` : '';
        const cursor = interactive ? 'cursor-pointer' : 'cursor-default';

        return `
            <div class="absolute w-12 h-12 flex items-center justify-center ${cursor} transition-all duration-500 ease-out z-10"
                 style="top: ${top}%; left: ${left}%; transform: translate(-50%, -50%);"
                 ${clickAttr}>
                <div class="w-full h-full rounded-full border-2 bg-gray-950 flex items-center justify-center transition-all duration-300"
                     style="${borderStyle}">
                    ${nodeContent}
                </div>
                ${isSelected ? `<div class="absolute -inset-2 rounded-full border border-${c.color} opacity-30 animate-pulse"></div>` : ''}
            </div>
        `;
    }).join('');

    return `
        <div class="relative w-full aspect-square max-w-[320px] mx-auto my-4">
            <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                <polygon points="${polyPoints}" fill="none" stroke="#1f2937" stroke-width="1" />
                ${points.map(p => `<line x1="50" y1="50" x2="${p.x}" y2="${p.y}" stroke="#1f2937" stroke-width="0.5" />`).join('')}
                ${selPoint ? `<line x1="50" y1="50" x2="${selPoint.x}" y2="${selPoint.y}" stroke="${color}" stroke-width="1.5" stroke-dasharray="2" class="animate-pulse">
                    <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
                </line>` : ''}
                <polygon points="${polyPoints}" fill="none" stroke="${color}" stroke-width="0.5" stroke-opacity="0.3" />
            </svg>
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-900/80 rounded-full border border-gray-700 flex items-center justify-center backdrop-blur-sm z-0">
                <div class="text-[${color}] opacity-20"><i data-lucide="hexagon" size="32"></i></div>
            </div>
            ${nodesHtml}
        </div>
        <div class="text-center mt-2">
             <h3 class="text-2xl font-display font-black tracking-widest uppercase drop-shadow-lg transition-all duration-300" style="color: ${color};">${selectedId}</h3>
             ${interactive ? `<p class="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Selecione seu tipo de Aura</p>` : ''}
        </div>
    `;
}
