/**
 * v2Service — Supabase direto, sem backend Express.
 *
 * Leituras públicas    → SELECT com anon key (RLS permissiva)
 * Operações atômicas   → RPC com SECURITY DEFINER (tc_buy_quote, etc.)
 * Outras mutations     → INSERT/UPDATE/DELETE com anon key (RLS permissiva)
 * Notificações Discord → fetch direto para webhook público
 */
import { supabase, normalizeUserId } from '../supabase';

// ── Constantes ────────────────────────────────────────────────────────

const SUPER_ADMIN_ID = '513323323355037717';
const ADMIN_IDS      = [SUPER_ADMIN_ID, '1262779092646758404', '521367784013922304', '741703273188229150'];
const ADMIN_ROLE_IDS = ['1100415887971991572', '1263215631784869949', '1335940980628521000'];
const MATCH_WEBHOOK  = 'https://discord.com/api/webhooks/1493917277530230855/JeSYgcrwBYIJ1pqey92jDe2MKHeLGAGKkKC1VIs6xA3aQlAeiFHz8w3K19-QZSq_7p_f';
const FINANCE_WEBHOOK = 'https://discord.com/api/webhooks/1497288755738841218/Zru0Rsaoh5JOGDS4G6ztFDCl61sGGUqDNmjcQkv5O_BFiG_zDrjbupi6wQvvhrtQeAn6';

// ── Tipos ─────────────────────────────────────────────────────────────

type UnsubFn = () => void;
type Callback<T> = (data: T[]) => void;
type SingleCallback<T> = (data: T | null) => void;
type ErrCallback = (err: any) => void;

// ── Helpers internos ──────────────────────────────────────────────────

const norm = (id: string) => id.startsWith('discord:') ? id : `discord:${id}`;

const isAdmin = (userId: string) =>
  ADMIN_IDS.includes(userId.replace('discord:', ''));

const webhook = async (url: string, embed: any) => {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch {}
};

// ── Cálculo de valor de cota (replica backend) ────────────────────────

const calcComponents = (f: any) => {
  const base = 50;
  const masterFloors = [210, 220, 230, 240, 250, 251];
  const floor = f.floor || 1;
  const isMaster = masterFloors.includes(floor);

  const factorRanking     = Math.max(0, (251 - (f.ranking || 250)) * 0.8);
  const effectivePop      = isMaster ? 100 : (f.popularity || 0);
  const factorPopularity  = effectivePop * 0.05;
  const factorPerformance = ((f.wins || 0) * 2) - ((f.losses || 0) * 1);
  const factorStreak      = (f.streak || 0) * 5;

  let floorGroup = 1;
  if (isMaster)         floorGroup = 100;
  else if (floor < 200) floorGroup = Math.floor(floor / 10) + 1;
  else                  floorGroup = 30;
  const floorBonus = floorGroup * 4;

  let levelBonus = 0;
  if (isMaster) {
    const level = Math.max(1, Math.min(12, f.level || 1));
    const mults: Record<number, number> = { 1:15,2:14,3:13,4:12,5:11,6:10,7:9,8:8,9:7,10:6,11:5,12:4 };
    levelBonus = (f.level || 1) * (mults[level] || 4);
  } else {
    levelBonus = (f.level || 1) * 2;
  }

  const perfSub   = base + factorRanking + factorPopularity + factorPerformance + factorStreak + floorBonus + levelBonus;
  const mktSub    = Math.max(0, ((f.volume_buy_24h || 0) - (f.volume_sell_24h || 0)) * 2);
  const raw       = perfSub + mktSub;
  const cur       = f.quote_value || 0;

  if (!cur) {
    const final = Math.max(20, Math.round(raw));
    const ratio = final / (raw || 1);
    return { total: final, performance: perfSub * ratio, market: mktSub * ratio };
  }

  let smoothed = cur + (raw - cur) * 0.3;
  const last24h = f.price_24h_ago || cur;
  smoothed = Math.min(last24h * 1.5, Math.max(last24h * 0.5, smoothed));
  const ownerRatio = (f.owner_buy_volume_24h || 0) / (f.volume_buy_24h || 1);
  if (ownerRatio > 0.5 && smoothed > cur) smoothed = cur;

  const final = Math.max(20, Math.round(smoothed));
  const ratio = final / (raw || 1);
  return { total: final, performance: perfSub * ratio, market: mktSub * ratio };
};

const calcValue = (f: any) => calcComponents(f).total;

const applyFightResult = (f: any, won: boolean, penalty: number) => {
  const masterFloors = [210, 220, 230, 240, 250, 251];
  const newWins   = won ? (f.wins || 0) + 1 : (f.wins || 0);
  const newLosses = won ? (f.losses || 0) : (f.losses || 0) + 1;
  const newStreak = won ? (f.streak > 0 ? f.streak + 1 : 1) : (f.streak < 0 ? f.streak - 1 : -1);

  let newRanking = Math.max(1, Math.min(251, (f.ranking || 250) - ((won ? 5 : -3) * penalty)));
  const isMaster = masterFloors.includes(f.floor || 1);
  let newFloor = won
    ? Math.min(251, (f.floor || 1) + 10)
    : isMaster ? (f.floor || 1) - 1
    : Math.max((f.floor || 1) >= 200 ? 200 : 1, (f.floor || 1) - 10);

  const newPop = Math.max(0, Math.min(100, (f.popularity || 0) + ((won ? 5 : -2) * penalty)));
  const updated = {
    ...f,
    wins: newWins, losses: newLosses, total_fights: (f.total_fights || 0) + 1,
    streak: newStreak, ranking: newRanking, floor: newFloor,
    popularity: newPop, last_fight_at: new Date().toISOString(),
  };
  updated.quote_value = calcValue(updated);
  delete updated.id;
  return updated;
};

// ── Helpers de subscrição ─────────────────────────────────────────────

/** Subscreve tabela pública: fetch inicial + canal Realtime para re-fetch. */
const subscribeTable = <T>(
  table: string,
  fetchFn: () => Promise<T[]>,
  callback: Callback<T>,
  onError: ErrCallback,
  filter?: string,
): UnsubFn => {
  fetchFn().then(callback).catch(onError);

  const channel = supabase
    .channel(`${table}_${Math.random().toString(36).slice(2)}`)
    .on('postgres_changes' as any,
      { event: '*', schema: 'public', table, ...(filter ? { filter } : {}) },
      () => fetchFn().then(callback).catch(onError))
    .subscribe();

  return () => channel.unsubscribe();
};

/** Polling de tabela privada: fetch inicial + setInterval. */
const pollTable = <T>(
  fetchFn: () => Promise<T[]>,
  callback: Callback<T>,
  onError: ErrCallback,
  ms = 8000,
): UnsubFn => {
  let active = true;
  const tick = () => fetchFn()
    .then(d => { if (active) callback(d); })
    .catch(onError);
  tick();
  const id = setInterval(() => { if (active) tick(); }, ms);
  return () => { active = false; clearInterval(id); };
};

// ── Serviço principal ─────────────────────────────────────────────────

export const v2Service = {

  // ─── Subscriptions ────────────────────────────────────────────────

  subscribeToV2User(userId: string, callback: SingleCallback<any>, onError: ErrCallback): UnsubFn {
    const uid = norm(userId);
    const fetch = () => supabase.from('tc_users').select('*').eq('id', uid).single()
      .then(r => r.data || null);
    fetch().then(callback).catch(onError);
    const ch = supabase.channel(`tc_users_${uid}`)
      .on('postgres_changes' as any,
        { event: '*', schema: 'public', table: 'tc_users', filter: `id=eq.${uid}` },
        () => fetch().then(callback).catch(onError))
      .subscribe();
    const poll = setInterval(() => fetch().then(callback).catch(onError), 10000);
    return () => { ch.unsubscribe(); clearInterval(poll); };
  },

  subscribeToFighters(callback: Callback<any>, onError: ErrCallback): UnsubFn {
    return subscribeTable(
      'tc_fighters',
      () => supabase.from('tc_fighters').select('*').then(r => r.data || []),
      callback, onError,
    );
  },

  subscribeToQuotes(userId: string, callback: Callback<any>, onError: ErrCallback): UnsubFn {
    const uid = norm(userId);
    return subscribeTable(
      'tc_quotes',
      () => supabase.from('tc_quotes').select('*').eq('user_id', uid).then(r => r.data || []),
      callback, onError, `user_id=eq.${uid}`,
    );
  },

  subscribeToTransactions(userId: string, callback: Callback<any>, onError: ErrCallback): UnsubFn {
    const uid = norm(userId);
    return pollTable(
      () => supabase.from('tc_transactions').select('*').eq('user_id', uid)
        .order('created_at', { ascending: false }).limit(50).then(r => r.data || []),
      callback, onError, 8000,
    );
  },

  subscribeToNPCMatches(callback: Callback<any>, onError: ErrCallback): UnsubFn {
    return subscribeTable(
      'tc_npc_matches',
      () => supabase.from('tc_npc_matches').select('*').order('created_at', { ascending: false }).limit(20).then(r => r.data || []),
      callback, onError,
    );
  },

  subscribeToFights(callback: Callback<any>, onError: ErrCallback): UnsubFn {
    return subscribeTable(
      'tc_fights',
      () => supabase.from('tc_fights').select('*').order('created_at', { ascending: false }).limit(50).then(r => r.data || []),
      callback, onError,
    );
  },

  subscribeToNotifications(userId: string, callback: Callback<any>, onError: ErrCallback): UnsubFn {
    const uid = norm(userId);
    return pollTable(
      () => supabase.from('tc_notifications').select('*').eq('user_id', uid).eq('is_read', false)
        .order('created_at', { ascending: false }).limit(10).then(r => r.data || []),
      callback, onError, 6000,
    );
  },

  subscribeToPendingTransactions(callback: Callback<any>, onError: ErrCallback): UnsubFn {
    return pollTable(
      () => supabase.from('tc_pending_transactions').select('*').eq('status', 'pending')
        .order('created_at', { ascending: false }).then(r => r.data || []),
      callback, onError, 8000,
    );
  },

  // ─── Mutations ────────────────────────────────────────────────────

  async initProfile(userId: string, name: string) {
    const uid = norm(userId);
    const rawId = userId.replace('discord:', '');
    const isUserAdmin = isAdmin(userId);

    const { data: existing } = await supabase.from('tc_users').select('*').eq('id', uid).single();

    if (existing) {
      const updates: any = {};
      if (existing.is_admin !== isUserAdmin) updates.is_admin = isUserAdmin;
      if (!existing.name && name) updates.name = name;
      if (!existing.user_type) updates.user_type = 'INVESTOR';
      if (Object.keys(updates).length > 0) {
        await supabase.from('tc_users').update(updates).eq('id', uid);
        return { ...existing, ...updates };
      }
      return existing;
    }

    const newUser = {
      id: uid, discord_id: rawId, username: name, name,
      coins_balance: 50, released_balance: 0,
      user_type: 'INVESTOR', is_admin: isUserAdmin,
      last_activity: new Date().toISOString(),
    };
    const { error } = await supabase.from('tc_users').insert(newUser);
    if (error) throw new Error(error.message);
    return newUser;
  },

  async buyQuote(userId: string, fighterId: string, amount: number) {
    const uid = norm(userId);
    const { data: fighter } = await supabase.from('tc_fighters').select('*').eq('id', fighterId).single();
    if (!fighter) return { error: 'Lutador não encontrado.' };
    if (uid === fighter.owner_id) return { error: 'Norma da Torre: lutador não pode comprar suas próprias cotas.' };
    if ((fighter.quotes_available || 0) < amount) return { error: 'Cotas indisponíveis.' };

    const unitValue = calcValue(fighter);
    const { data: result, error } = await supabase.rpc('tc_buy_quote', {
      p_user_id: uid, p_fighter_id: fighterId, p_quantity: amount, p_unit_price: unitValue,
    });
    if (error) return { error: error.message };
    if (result?.error) return { error: result.error };

    // Repassa 20% para o dono
    const cut = Math.floor(unitValue * amount * 0.20);
    if (fighter.owner_id && cut > 0) {
      const { data: owner } = await supabase.from('tc_users').select('coins_balance').eq('id', fighter.owner_id).single();
      if (owner) {
        await supabase.from('tc_users').update({ coins_balance: owner.coins_balance + cut }).eq('id', fighter.owner_id);
        await supabase.from('tc_transactions').insert({
          user_id: fighter.owner_id, type: 'fight_cut', amount: cut,
          balance_after: owner.coins_balance + cut, released_after: 0,
          metadata: { source_fighter: fighterId },
        });
      }
    }
    await supabase.from('tc_fighters').update({ quotes_available: fighter.quotes_available - amount }).eq('id', fighterId);
    return result;
  },

  async sellQuote(userId: string, fighterId: string, amount: number) {
    const uid = norm(userId);
    const { data: fighter } = await supabase.from('tc_fighters').select('*').eq('id', fighterId).single();
    if (!fighter) return { error: 'Lutador não encontrado.' };

    const comps = calcComponents(fighter);
    const weeksSince = (Date.now() - new Date(fighter.last_match_at || Date.now()).getTime()) / (7 * 24 * 60 * 60 * 1000);
    const inactivityPenalty = weeksSince > 2 ? Math.min(0.5, (weeksSince - 2) * 0.05) : 0;
    const netUnit = Math.floor(comps.total * (1 - inactivityPenalty) * 0.95);

    const { data: result, error } = await supabase.rpc('tc_sell_quote', {
      p_user_id: uid, p_fighter_id: fighterId, p_quantity: amount, p_unit_price: netUnit,
    });
    if (error) return { error: error.message };
    if (result?.error) return { error: result.error };

    await supabase.from('tc_fighters').update({ quotes_available: (fighter.quotes_available || 0) + amount }).eq('id', fighterId);
    return result;
  },

  async registerFighter(data: any) {
    const { requesterId, targetId, fighterName, name: bodyName, registrationMode, stats, isAdmin: reqAdmin } = data;
    const name = fighterName || bodyName || stats?.name;
    if (!requesterId || !name || !registrationMode) return { error: 'Dados incompletos.' };

    const rid = norm(requesterId);
    let finalOwnerId = rid;

    if (registrationMode === 'NPC') {
      if (!reqAdmin) return { error: 'Apenas Juízes podem registrar NPCs.' };
      finalOwnerId = 'NPC_ASSOCIATION';
    } else if (registrationMode === 'OTHER') {
      if (!targetId) return { error: 'ID do usuário alvo é obrigatório.' };
      finalOwnerId = norm(targetId);
    }

    if (finalOwnerId !== 'NPC_ASSOCIATION') {
      const { count } = await supabase.from('tc_fighters').select('id', { count: 'exact', head: true }).eq('owner_id', finalOwnerId);
      if ((count || 0) >= 2) return { error: `Limite de 2 lutadores atingido.` };
    }

    const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fighterId = `${finalOwnerId}____${safeName}`;

    const newFighter: any = {
      id: fighterId,
      owner_id: finalOwnerId !== 'NPC_ASSOCIATION' ? finalOwnerId : null,
      name, nen_type: stats?.nenType || 'Unknown',
      floor: stats?.floor || 1,
      ranking: stats?.floor ? 252 - stats.floor : 250,
      wins: stats?.wins || 0, losses: stats?.losses || 0, total_fights: stats?.total_fights || 0,
      popularity: 10, quotes_available: 1000, is_npc: registrationMode === 'NPC',
      image_url: stats?.imageUrl?.trim() || `https://picsum.photos/seed/${encodeURIComponent(name)}/400/600`,
      quote_value: 0,
    };
    newFighter.quote_value = calcValue(newFighter);

    const { error: fErr } = await supabase.from('tc_fighters').insert(newFighter);
    if (fErr) return { error: fErr.message };

    if (finalOwnerId !== 'NPC_ASSOCIATION') {
      const { data: user } = await supabase.from('tc_users').select('user_type').eq('id', finalOwnerId).single();
      const newType = !user ? 'FIGHTER' : user.user_type === 'INVESTOR' ? 'BOTH' : user.user_type;
      await supabase.from('tc_users').upsert({
        id: finalOwnerId, discord_id: finalOwnerId.replace('discord:', ''),
        username: name, name, user_type: newType, is_fighter: true,
      });
    }

    webhook(MATCH_WEBHOOK, {
      title: '🥊 NOVO LUTADOR REGISTRADO', description: `**${name}** entrou na arena!`,
      color: 3447003, fields: [{ name: 'Andar', value: `${newFighter.floor}`, inline: true }],
      timestamp: new Date().toISOString(),
    });

    return { success: true, fighter: newFighter };
  },

  async updateFighter(id: string, data: any) {
    const { data: f } = await supabase.from('tc_fighters').select('*').eq('id', id).single();
    if (!f) return { error: 'Lutador não encontrado.' };
    const updates: any = { ...data };
    updates.quote_value = calcValue({ ...f, ...updates });
    const { error } = await supabase.from('tc_fighters').update(updates).eq('id', id);
    if (error) return { error: error.message };
    return { success: true };
  },

  async deleteFighter(id: string) {
    const { data: f } = await supabase.from('tc_fighters').select('*').eq('id', id).single();
    if (!f) return { error: 'Lutador não encontrado.' };
    const { error } = await supabase.from('tc_fighters').delete().eq('id', id);
    if (error) return { error: error.message };
    if (f.owner_id) await supabase.from('tc_users').update({ is_fighter: false, user_type: 'INVESTOR' }).eq('id', f.owner_id);
    webhook(MATCH_WEBHOOK, { title: '🚫 LUTADOR EXPULSO', description: `**${f.name}** removido.`, color: 16711680, timestamp: new Date().toISOString() });
    return { success: true };
  },

  async recordFight(fighterAId: string, fighterBId: string, winnerId: string) {
    const [{ data: fA }, { data: fB }] = await Promise.all([
      supabase.from('tc_fighters').select('*').eq('id', fighterAId).single(),
      supabase.from('tc_fighters').select('*').eq('id', fighterBId).single(),
    ]);
    if (!fA || !fB) return { error: 'Lutador não encontrado.' };

    const { data: fightResult, error: fErr } = await supabase.rpc('tc_record_fight', {
      p_fighter_a_id: fighterAId, p_fighter_b_id: fighterBId, p_winner_id: winnerId, p_judge_id: null, p_is_npc: false,
    });
    if (fErr) return { error: fErr.message };

    const penalty = fightResult?.penalty ?? 1;
    const aWon = winnerId === fighterAId;
    await Promise.all([
      supabase.from('tc_fighters').update(applyFightResult(fA, aWon,  penalty)).eq('id', fighterAId),
      supabase.from('tc_fighters').update(applyFightResult(fB, !aWon, penalty)).eq('id', fighterBId),
    ]);

    webhook(MATCH_WEBHOOK, {
      title: '🏁 RESULTADO DE COMBATE', description: `**${fA.name}** vs **${fB.name}**!`,
      color: 0x4CAF50,
      fields: [
        { name: '🏆 VENCEDOR', value: aWon ? fA.name : fB.name, inline: true },
        { name: '💀 DERROTADO', value: aWon ? fB.name : fA.name, inline: true },
      ],
      timestamp: new Date().toISOString(),
    });
    return { success: true };
  },

  async sanctionMatch({ webhookUrl, fighterA, fighterB, floor, mentionRoles, judgeName }: any) {
    if (!webhookUrl || !fighterA || !fighterB) return { error: 'Dados incompletos.' };
    const COMPETITOR_ROLE = '1100984179845505044';
    const mentions = [fighterA.user_id, fighterB.user_id]
      .filter(id => id && id !== 'NPC_ASSOCIATION')
      .map((id: string) => `<@${id.replace('discord:', '')}>`)
      .join(' ');
    const mention = mentionRoles && mentionRoles !== '@everyone'
      ? `${mentionRoles} ${mentions}`.trim()
      : `<@&${COMPETITOR_ROLE}> ${mentions}`.trim();

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: mention,
        embeds: [{
          title: '⚡ LUTA SANCIONADA NA TORRE CELESTIAL ⚡',
          description: `Nova disputa no **Andar ${floor}**!`,
          color: 0x2196F3,
          fields: [
            { name: '🔴 COMPETIDOR A', value: `**${fighterA.name}**\n*(Ranking #${fighterA.ranking})*`, inline: true },
            { name: '🔵 COMPETIDOR B', value: `**${fighterB.name}**\n*(Ranking #${fighterB.ranking})*`, inline: true },
            { name: '⚖️ JUIZ', value: judgeName, inline: true },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    return { success: true };
  },

  async deposit(userId: string, amountBRL: number) {
    const uid = norm(userId);
    if (amountBRL < 0.5) return { error: 'Valor mínimo R$ 0,50.' };
    const { data: user } = await supabase.from('tc_users').select('username').eq('id', uid).single();
    if (!user) return { error: 'Usuário não encontrado.' };

    const amountTC = Math.floor(amountBRL * 100);
    const { data: pending, error } = await supabase.from('tc_pending_transactions').insert({
      user_id: uid, user_name: user.username, type: 'deposit',
      amount_reais: amountBRL, amount_tc: amountTC, status: 'pending',
    }).select().single();
    if (error) return { error: error.message };

    await supabase.from('tc_notifications').insert({
      user_id: norm(SUPER_ADMIN_ID), type: 'deposit_request',
      message: `${user.username} solicitou R$ ${amountBRL.toFixed(2)}.`,
      metadata: { pending_tx_id: pending.id },
    });
    webhook(FINANCE_WEBHOOK, {
      title: '🟡 FINANCEIRO: NOVO DEPÓSITO', description: `**${user.username}** solicitou depósito.`,
      color: 0xFFA500,
      fields: [{ name: 'R$', value: `R$ ${amountBRL.toFixed(2)}`, inline: true }, { name: 'TC', value: `${amountTC} TC`, inline: true }],
      timestamp: new Date().toISOString(),
    });
    return { success: true, pendingTxId: pending.id };
  },

  async withdraw(userId: string, amountCoins: number, method: string, details?: any) {
    const uid = norm(userId);
    if (amountCoins < 100) return { error: 'Mínimo 100 Coins.' };
    const { data: user } = await supabase.from('tc_users').select('*').eq('id', uid).single();
    if (!user) return { error: 'Usuário não encontrado.' };
    if (method !== 'CHARACTER' && amountCoins > (user.released_balance || 0))
      return { error: `Saldo liberado insuficiente (${user.released_balance} TC).` };
    if (user.coins_balance < amountCoins) return { error: 'Saldo total insuficiente.' };

    await supabase.from('tc_users').update({
      coins_balance: user.coins_balance - amountCoins,
      released_balance: Math.max(0, (user.released_balance || 0) - (method !== 'CHARACTER' ? amountCoins : 0)),
    }).eq('id', uid);

    const { data: pending, error } = await supabase.from('tc_pending_transactions').insert({
      user_id: uid, user_name: user.username, type: 'withdraw',
      amount_reais: amountCoins / 100, amount_tc: amountCoins, method, details, status: 'pending',
    }).select().single();
    if (error) return { error: error.message };

    await supabase.from('tc_notifications').insert({
      user_id: norm(SUPER_ADMIN_ID), type: 'withdraw_request',
      message: `${user.username} solicitou saque de ${amountCoins} TC.`,
      metadata: { pending_tx_id: pending.id },
    });
    webhook(FINANCE_WEBHOOK, {
      title: '🔴 FINANCEIRO: SAQUE SOLICITADO', description: `**${user.username}** solicitou resgate.`,
      color: 0xFF0000,
      fields: [{ name: 'TC', value: `${amountCoins} TC`, inline: true }, { name: 'Método', value: method, inline: true }],
      timestamp: new Date().toISOString(),
    });
    return { success: true, pendingTxId: pending.id };
  },

  async processPendingTransaction(adminId: string, txId: string, action: 'APPROVE' | 'REJECT', reason?: string) {
    const { data, error } = await supabase.rpc('tc_process_pending_tx', {
      p_tx_id: txId, p_action: action.toLowerCase(),
      p_admin_id: norm(adminId), p_reason: reason || null,
    });
    if (error) return { error: error.message };
    if (data?.error) return { error: data.error };
    return { success: true };
  },

  // Alias usado pelo V2Dashboard
  processTransaction(txId: string, action: 'APPROVE' | 'REJECT', adminId: string, reason?: string) {
    return v2Service.processPendingTransaction(adminId, txId, action, reason);
  },

  async runNPCMatchmaking(userId: string, _isJudge: boolean, floorGroup?: string) {
    const { data: npcs } = await supabase.from('tc_fighters').select('*').eq('is_npc', true);
    if (!npcs?.length) return { error: 'Nenhum NPC cadastrado.' };

    const groups: Record<string, any[]> = {};
    npcs.forEach(npc => {
      const f = npc.floor || 1;
      const start = f < 10 ? 1 : Math.floor(f / 10) * 10;
      const key = `${start}-${start + (f < 10 ? 8 : 9)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(npc);
    });

    let valid = Object.keys(groups).filter(k => groups[k].length >= 2);
    if (floorGroup) {
      if (!groups[floorGroup] || groups[floorGroup].length < 2) return { error: `Grupo ${floorGroup} insuficiente.` };
      valid = [floorGroup];
    }
    if (!valid.length) return { error: 'Sem grupos válidos.' };

    const grp = groups[valid[Math.floor(Math.random() * valid.length)]];
    let iA = Math.floor(Math.random() * grp.length);
    let iB = Math.floor(Math.random() * grp.length);
    while (iA === iB) iB = Math.floor(Math.random() * grp.length);

    const fA = grp[iA], fB = grp[iB];
    const wrA = (fA.wins || 0) / (fA.total_fights || 1);
    const wrB = (fB.wins || 0) / (fB.total_fights || 1);
    let chanceA = 50;
    if (wrA > wrB) chanceA += 5; else if (wrB > wrA) chanceA -= 5;
    if ((fA.total_fights || 0) > (fB.total_fights || 0)) chanceA += 5; else chanceA -= 5;

    const matchId = `npc_${Date.now()}`;
    const matchData = {
      id: matchId, fighter1_id: fA.id, fighter2_id: fB.id,
      scheduled_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      result: { win_probability_a: chanceA, fighter_a_name: fA.name, fighter_b_name: fB.name },
    };
    const { error } = await supabase.from('tc_npc_matches').insert(matchData);
    if (error) return { error: error.message };

    webhook(MATCH_WEBHOOK, {
      title: '🎰 LUTA NPC AGENDADA', description: `Combate em breve!`,
      color: 0xFFA000,
      fields: [{ name: '🔴 A', value: `**${fA.name}**`, inline: true }, { name: '🔵 B', value: `**${fB.name}**`, inline: true }],
      timestamp: new Date().toISOString(),
    });
    return { success: true, match: matchData };
  },

  // Alias antigo
  npcMatchmaking(userId: string, floorGroup?: string) {
    return v2Service.runNPCMatchmaking(userId, true, floorGroup);
  },

  async resolveNPCMatches() {
    const { data: pending } = await supabase.from('tc_npc_matches').select('*')
      .eq('status', 'pending').lte('scheduled_at', new Date().toISOString());
    if (!pending?.length) return { message: 'Nenhum combate pendente.' };

    for (const match of pending) {
      const probA = match.result?.win_probability_a ?? 50;
      const winnerId = Math.random() * 100 <= probA ? match.fighter1_id : match.fighter2_id;
      const loserId  = winnerId === match.fighter1_id ? match.fighter2_id : match.fighter1_id;

      const [{ data: w }, { data: l }] = await Promise.all([
        supabase.from('tc_fighters').select('*').eq('id', winnerId).single(),
        supabase.from('tc_fighters').select('*').eq('id', loserId).single(),
      ]);
      if (w && l) {
        await Promise.all([
          supabase.from('tc_fighters').update(applyFightResult(w, true,  1)).eq('id', winnerId),
          supabase.from('tc_fighters').update(applyFightResult(l, false, 1)).eq('id', loserId),
        ]);
        await supabase.rpc('tc_record_fight', {
          p_fighter_a_id: match.fighter1_id, p_fighter_b_id: match.fighter2_id,
          p_winner_id: winnerId, p_is_npc: true,
        });
      }
      await supabase.from('tc_npc_matches').update({
        status: 'completed', result: { ...match.result, winner_id: winnerId },
      }).eq('id', match.id);
    }
    return { success: true, processed: pending.length };
  },

  async recalculateAllFighters(userId: string, _isJudge?: boolean) {
    const { data: fighters } = await supabase.from('tc_fighters').select('*');
    if (!fighters?.length) return { message: 'Nenhum lutador.', count: 0 };
    for (const f of fighters) {
      const comps = calcComponents(f);
      await supabase.from('tc_fighters').update({
        quote_value: comps.total, performance_value: comps.performance, market_value: comps.market,
      }).eq('id', f.id);
    }
    return { message: `${fighters.length} lutadores atualizados.`, count: fighters.length };
  },

  // Alias antigo
  recalculateFighters(userId: string) {
    return v2Service.recalculateAllFighters(userId);
  },

  async runMassTest(userId: string) {
    return v2Service.runNPCMatchmaking(userId, true);
  },

  async backupFighters(userId: string, slot: number) {
    const { data: fighters } = await supabase.from('tc_fighters').select('*');
    const { error } = await supabase.from('tc_backups').upsert({
      id: `slot_${slot}`, fighters: fighters || [], created_by: norm(userId),
    });
    if (error) return { error: error.message };
    return { success: true, slot };
  },

  // Alias antigo
  backup(userId: string, slot: number) {
    return v2Service.backupFighters(userId, slot);
  },

  async restoreFighters(userId: string, slot: number) {
    const { data: backup } = await supabase.from('tc_backups').select('fighters').eq('id', `slot_${slot}`).single();
    if (!backup) return { error: 'Backup não encontrado.' };
    await supabase.from('tc_fighters').delete().neq('id', '__never__');
    for (const f of backup.fighters as any[]) {
      const { id, ...data } = f;
      await supabase.from('tc_fighters').insert({ id, ...data });
    }
    return { success: true, slot };
  },

  // Alias antigo
  restore(userId: string, slot: number) {
    return v2Service.restoreFighters(userId, slot);
  },

  async clearArena(userId: string) {
    await supabase.from('tc_quotes').delete().neq('fighter_id', '__never__');
    await supabase.from('tc_fights').delete().neq('id', '__never__');
    await supabase.from('tc_transactions').delete().neq('id', '__never__');
    await supabase.from('tc_fighters').delete().neq('id', '__never__');
    await supabase.from('tc_users').update({ user_type: 'INVESTOR', is_fighter: false }).neq('id', '__never__');
    return { success: true };
  },

  async markNotificationsRead(notificationIds: string[]) {
    await supabase.from('tc_notifications').update({ is_read: true }).in('id', notificationIds);
    return { success: true };
  },

  async updatePhone(userId: string, phone: string) {
    await supabase.from('tc_users').update({ phone }).eq('id', norm(userId));
    return { success: true };
  },

  async marketAnalysis(fighterId: string) {
    const { data: f } = await supabase.from('tc_fighters').select('*').eq('id', fighterId).single();
    if (!f) return { error: 'Lutador não encontrado.' };
    const ratio = (f.owner_buy_volume_24h || 0) / (f.volume_buy_24h || 1);
    return {
      id: fighterId, auto_pump: ratio > 0.5, owner_ratio: ratio,
      message: ratio > 0.5 ? 'ALERTA: Auto-Pump detectado.' : 'Atividade de mercado saudável.',
    };
  },
};
