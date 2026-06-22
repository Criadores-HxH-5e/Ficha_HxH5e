import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cookieParser from "cookie-parser";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Supabase Admin Client (service_role — nunca expor no frontend) ──
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const app = express();
app.use(express.json());
app.use(cookieParser());

const SUPER_ADMIN_ID = "513323323355037717";
const ADMIN_IDS = [SUPER_ADMIN_ID, "1262779092646758404", "521367784013922304", "741703273188229150"];
const DISCORD_MATCH_WEBHOOK   = "https://discord.com/api/webhooks/1493917277530230855/JeSYgcrwBYIJ1pqey92jDe2MKHeLGAGKkKC1VIs6xA3aQlAeiFHz8w3K19-QZSq_7p_f";
const DISCORD_FINANCE_WEBHOOK = "https://discord.com/api/webhooks/1497288755738841218/Zru0Rsaoh5JOGDS4G6ztFDCl61sGGUqDNmjcQkv5O_BFiG_zDrjbupi6wQvvhrtQeAn6";

// ── Helpers ──────────────────────────────────────────────────────────

const normalizeId = (id: string) =>
  id.startsWith("discord:") ? id : `discord:${id}`;

const isAdminUser = async (id: string | undefined): Promise<boolean> => {
  if (!id) return false;
  const raw = id.startsWith("discord:") ? id.replace("discord:", "") : id;
  if (ADMIN_IDS.includes(raw)) return true;
  const { data } = await supabase
    .from("tc_users")
    .select("is_admin")
    .eq("id", normalizeId(id))
    .single();
  return data?.is_admin === true;
};

const createSessionToken = (discordUser: any, isAdmin: boolean, roles: string[]) =>
  jwt.sign(
    {
      sub:          `discord:${discordUser.id}`,
      role:         "authenticated",
      discord_id:   discordUser.id,
      username:     discordUser.username,
      is_admin:     isAdmin,
      discord_roles: roles,
    },
    process.env.SUPABASE_JWT_SECRET!,
    { expiresIn: "7d" }
  );

async function sendDiscordNotification(webhookUrl: string, embed: any) {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (e) {
    console.error("Webhook Discord falhou:", e);
  }
}

const getRedirectUri = (req: express.Request) => {
  let base = process.env.APP_URL;
  if (!base) {
    const host = req.headers["x-forwarded-host"] || req.headers.host || "app-torre-celestial.vercel.app";
    base = `https://${host}`;
  }
  return `${base.replace(/\/+$/, "")}/api/auth/discord/callback`;
};

// ── Quote Value (mesma lógica do original) ───────────────────────────

const calculateQuoteValueComponents = (fighter: any) => {
  const base = 50;
  const masterFloors = [210, 220, 230, 240, 250, 251];
  const floor = fighter.floor || 1;
  const isFloorMaster = masterFloors.includes(floor);

  const factorRanking     = Math.max(0, (251 - (fighter.ranking || 250)) * 0.8);
  const effectivePop      = isFloorMaster ? 100 : (fighter.popularity || 0);
  const factorPopularity  = effectivePop * 0.05;
  const factorPerformance = ((fighter.wins || 0) * 2) - ((fighter.losses || 0) * 1);
  const factorStreak      = (fighter.streak || 0) * 5;

  let floorGroup = 1;
  if (isFloorMaster)     floorGroup = 100;
  else if (floor < 200)  floorGroup = Math.floor(floor / 10) + 1;
  else                   floorGroup = 30;
  const floorBonus = floorGroup * 4;

  let levelBonus = 0;
  if (isFloorMaster) {
    const level = Math.max(1, Math.min(12, fighter.level || 1));
    const mults: Record<number, number> = { 1:15, 2:14, 3:13, 4:12, 5:11, 6:10, 7:9, 8:8, 9:7, 10:6, 11:5, 12:4 };
    levelBonus = (fighter.level || 1) * (mults[level] || 4);
  } else {
    levelBonus = (fighter.level || 1) * 2;
  }

  const performanceSubtotal = base + factorRanking + factorPopularity + factorPerformance + factorStreak + floorBonus + levelBonus;
  const marketSubtotal      = Math.max(0, ((fighter.volume_buy_24h || 0) - (fighter.volume_sell_24h || 0)) * 2);
  const rawValor             = performanceSubtotal + marketSubtotal;

  const currentVal = fighter.quote_value || 0;
  if (!currentVal) {
    const finalInitial = Math.max(20, Math.round(rawValor));
    const ratio = finalInitial / (rawValor || 1);
    return { total: finalInitial, performance: performanceSubtotal * ratio, market: marketSubtotal * ratio };
  }

  let smoothed = currentVal + (rawValor - currentVal) * 0.3;
  const last24h = fighter.price_24h_ago || currentVal;
  smoothed = Math.min(last24h * 1.5, Math.max(last24h * 0.5, smoothed));

  const ownerRatio = (fighter.owner_buy_volume_24h || 0) / (fighter.volume_buy_24h || 1);
  if (ownerRatio > 0.5 && smoothed > currentVal) smoothed = currentVal;

  const finalTotal = Math.max(20, Math.round(smoothed));
  const ratio = finalTotal / (rawValor || 1);
  return { total: finalTotal, performance: performanceSubtotal * ratio, market: marketSubtotal * ratio };
};

const calculateQuoteValue = (fighter: any) => calculateQuoteValueComponents(fighter).total;

const processFighterUpdate = (f: any, won: boolean, penaltyMult: number) => {
  const masterFloors = [210, 220, 230, 240, 250, 251];
  const newWins   = won ? (f.wins || 0) + 1 : (f.wins || 0);
  const newLosses = won ? (f.losses || 0) : (f.losses || 0) + 1;
  const newStreak = won ? (f.streak > 0 ? f.streak + 1 : 1) : (f.streak < 0 ? f.streak - 1 : -1);

  let newRanking = f.ranking || 250;
  newRanking = Math.max(1, Math.min(251, newRanking - ((won ? 5 : -3) * penaltyMult)));

  let floor = f.floor || 1;
  const isMaster = masterFloors.includes(floor);
  let newFloor = floor;
  if (won) {
    newFloor = Math.min(251, floor + 10);
  } else if (isMaster) {
    newFloor = floor - 1;
  } else {
    newFloor = Math.max(floor >= 200 ? 200 : 1, floor - 10);
  }

  const newPop = Math.max(0, Math.min(100, (f.popularity || 0) + ((won ? 5 : -2) * penaltyMult)));

  const updated: any = {
    ...f,
    wins: newWins, losses: newLosses,
    total_fights: (f.total_fights || 0) + 1,
    streak: newStreak, ranking: newRanking, floor: newFloor, popularity: newPop,
    last_match_at: new Date().toISOString(),
  };

  if (masterFloors.includes(newFloor)) {
    const now = Date.now();
    const last = f.last_scholarship_at ? new Date(f.last_scholarship_at).getTime() : 0;
    if (now - last > 7 * 24 * 60 * 60 * 1000) {
      updated.jenny_blocked = (f.jenny_blocked || 0) + 200;
      updated.last_scholarship_at = new Date().toISOString();
    }
  }

  const comps = calculateQuoteValueComponents(updated);
  return { ...updated, quote_value: comps.total, performance_value: comps.performance, market_value: comps.market };
};

// ════════════════════════════════════════════════════════════
// ROTAS
// ════════════════════════════════════════════════════════════

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok", v: "6.0-SUPABASE",
    vercel: !!process.env.VERCEL,
    env: {
      has_discord_id:     !!process.env.DISCORD_CLIENT_ID,
      has_supabase_url:   !!process.env.SUPABASE_URL,
      has_service_role:   !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      has_jwt_secret:     !!process.env.SUPABASE_JWT_SECRET,
    },
  });
});

// ── Discord OAuth ────────────────────────────────────────────────────

app.get("/api/auth/discord/url", (req, res) => {
  const cid = process.env.DISCORD_CLIENT_ID;
  if (!cid) return res.status(500).json({ error: "DISCORD_CLIENT_ID não configurado." });
  const params = new URLSearchParams({
    client_id: cid,
    redirect_uri: getRedirectUri(req),
    response_type: "code",
    scope: "identify email guilds.members.read",
    state: (req.query.state as string) || "",
  });
  res.json({ url: `https://discord.com/api/oauth2/authorize?${params}` });
});

app.get("/api/auth/discord/callback", async (req, res) => {
  const code = req.query.code as string;
  if (!code) return res.status(400).send("Código Discord ausente.");

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      body: new URLSearchParams({
        client_id:     process.env.DISCORD_CLIENT_ID || "",
        client_secret: process.env.DISCORD_CLIENT_SECRET || "",
        grant_type:    "authorization_code",
        code,
        redirect_uri:  getRedirectUri(req),
      }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!tokenRes.ok) throw new Error(`Token Discord falhou: ${await tokenRes.text()}`);
    const { access_token } = await tokenRes.json();

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const discordUser = await userRes.json();

    const ADMIN_ROLE_IDS = ["1100415887971991572", "1263215631784869949", "1335940980628521000"];
    let roles: string[] = [];
    const gid = process.env.DISCORD_GUILD_ID;
    if (gid) {
      try {
        const mRes = await fetch(`https://discord.com/api/users/@me/guilds/${gid}/member`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (mRes.ok) roles = (await mRes.json()).roles || [];
      } catch {}
    }

    const isAdmin = roles.some(r => ADMIN_ROLE_IDS.includes(r));
    discordUser.roles = roles;

    const sessionToken = createSessionToken(discordUser, isAdmin, roles);

    res.send(`
      <html><body style="background:#1a1a1a;color:white;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif">
        <script>
          if (window.opener) {
            window.opener.postMessage({
              type: 'DISCORD_AUTH_SUCCESS',
              payload: { user: ${JSON.stringify(discordUser)}, token: ${JSON.stringify(sessionToken)} }
            }, '*');
            window.close();
          } else { window.location.href = '/'; }
        </script>
        <p style="color:#5865f2;font-weight:bold">Hunter Autorizado! Sincronizando com a Arena...</p>
      </body></html>
    `);
  } catch (e: any) {
    res.status(500).send(`Erro na Autenticação: ${e.message}`);
  }
});

// ── Token exchange (HxH5e implicit-flow token → Torre JWT) ──────────
// Aceita o discord_access_token salvo pelo HxH5e e devolve um JWT da Torre,
// evitando que o usuário precise logar novamente ao abrir /torre/.
app.post("/api/auth/discord/token-exchange", async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) return res.status(400).json({ error: "access_token obrigatório." });

  try {
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!userRes.ok) return res.status(401).json({ error: "Token Discord inválido ou expirado." });
    const discordUser = await userRes.json();

    const ADMIN_ROLE_IDS = ["1100415887971991572", "1263215631784869949", "1335940980628521000"];
    let roles: string[] = [];
    const gid = process.env.DISCORD_GUILD_ID;
    if (gid) {
      try {
        const mRes = await fetch(`https://discord.com/api/users/@me/guilds/${gid}/member`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (mRes.ok) roles = (await mRes.json()).roles || [];
      } catch {}
    }

    const isAdmin = roles.some(r => ADMIN_ROLE_IDS.includes(r));
    discordUser.roles = roles;

    const sessionToken = createSessionToken(discordUser, isAdmin, roles);
    res.json({ user: discordUser, token: sessionToken });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── V2 Profile ───────────────────────────────────────────────────────

app.post("/api/v2/init-profile", async (req, res) => {
  let { userId, name } = req.body;
  if (!userId || !name) return res.status(400).json({ error: "Dados incompletos." });

  const uid = normalizeId(userId);

  try {
    const { data: existing } = await supabase
      .from("tc_users")
      .select("*")
      .eq("id", uid)
      .single();

    const isUserAdmin = await isAdminUser(uid);

    if (existing) {
      const updates: any = {};
      if (existing.is_admin !== isUserAdmin) updates.is_admin = isUserAdmin;
      if (!existing.name && name)             updates.name = name;
      if (!existing.user_type)                updates.user_type = "INVESTOR";
      if (Object.keys(updates).length > 0) {
        await supabase.from("tc_users").update(updates).eq("id", uid);
        return res.json({ ...existing, ...updates });
      }
      return res.json(existing);
    }

    const newUser = {
      id:               uid,
      discord_id:       userId.replace("discord:", ""),
      username:         name,
      name,
      coins_balance:    50,
      released_balance: 0,
      user_type:        "INVESTOR",
      is_admin:         isUserAdmin,
      last_activity:    new Date().toISOString(),
    };

    await supabase.from("tc_users").insert(newUser);
    res.json(newUser);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Buy Quote ────────────────────────────────────────────────────────

app.post("/api/v2/buy-quote", async (req, res) => {
  const { userId, fighterId, amount } = req.body;
  if (!userId || !fighterId || !amount || amount <= 0)
    return res.status(400).json({ error: "Dados inválidos." });

  const uid = normalizeId(userId);

  try {
    const { data: fighter } = await supabase
      .from("tc_fighters")
      .select("*")
      .eq("id", fighterId)
      .single();

    if (!fighter) throw new Error("Lutador não encontrado.");
    if (uid === fighter.owner_id)
      throw new Error("Norma da Torre: um lutador não pode comprar suas próprias cotas.");
    if ((fighter.quotes_available || 0) < amount)
      throw new Error("Cotas indisponíveis. O mercado atingiu o limite de capitalização.");

    const unitValue = calculateQuoteValue(fighter);

    const { data: result, error } = await supabase.rpc("tc_buy_quote", {
      p_user_id:    uid,
      p_fighter_id: fighterId,
      p_quantity:   amount,
      p_unit_price: unitValue,
    });

    if (error) throw new Error(error.message);
    if (result?.error) throw new Error(result.error);

    // Repassa 20% da compra para o dono do lutador
    const fighterCut = Math.floor(unitValue * amount * 0.20);
    if (fighter.owner_id && fighterCut > 0) {
      const { data: owner } = await supabase
        .from("tc_users").select("coins_balance").eq("id", fighter.owner_id).single();
      if (owner) {
        await supabase.from("tc_users")
          .update({ coins_balance: owner.coins_balance + fighterCut })
          .eq("id", fighter.owner_id);
        await supabase.from("tc_transactions").insert({
          user_id:        fighter.owner_id,
          type:           "fight_cut",
          amount:         fighterCut,
          balance_after:  owner.coins_balance + fighterCut,
          released_after: 0,
          metadata:       { source_fighter: fighterId },
        });
      }
    }

    // Atualiza quotes_available
    await supabase
      .from("tc_fighters")
      .update({ quotes_available: fighter.quotes_available - amount })
      .eq("id", fighterId);

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Sell Quote ───────────────────────────────────────────────────────

app.post("/api/v2/sell-quote", async (req, res) => {
  const { userId, fighterId, amount } = req.body;
  if (!userId || !fighterId || !amount || amount <= 0)
    return res.status(400).json({ error: "Dados inválidos." });

  const uid = normalizeId(userId);

  try {
    const { data: fighter } = await supabase
      .from("tc_fighters")
      .select("*")
      .eq("id", fighterId)
      .single();

    if (!fighter) throw new Error("Lutador não encontrado.");

    const comps = calculateQuoteValueComponents(fighter);

    const lastMatchDate = fighter.last_match_at ? new Date(fighter.last_match_at).getTime() : Date.now();
    const weeksSince = (Date.now() - lastMatchDate) / (7 * 24 * 60 * 60 * 1000);
    const inactivityPenalty = weeksSince > 2 ? Math.min(0.5, (weeksSince - 2) * 0.05) : 0;

    const unitValue = comps.total * (1 - inactivityPenalty);
    const fee = 0.05;
    const netUnitValue = Math.floor(unitValue * (1 - fee));

    const { data: result, error } = await supabase.rpc("tc_sell_quote", {
      p_user_id:    uid,
      p_fighter_id: fighterId,
      p_quantity:   amount,
      p_unit_price: netUnitValue,
    });

    if (error) throw new Error(error.message);
    if (result?.error) throw new Error(result.error);

    await supabase
      .from("tc_fighters")
      .update({ quotes_available: fighter.quotes_available + amount })
      .eq("id", fighterId);

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Register Fighter ─────────────────────────────────────────────────

app.post("/api/v2/register-fighter", async (req, res) => {
  const { requesterId, targetId, fighterName, name: bodyName, registrationMode, stats, isAdmin } = req.body;
  const name = fighterName || bodyName || stats?.name;
  if (!requesterId || !name || !registrationMode)
    return res.status(400).json({ error: "Dados incompletos." });

  try {
    const rid = normalizeId(requesterId);
    let finalOwnerId = rid;

    if (registrationMode === "NPC") {
      if (!isAdmin) return res.status(403).json({ error: "Apenas Juízes podem registrar NPCs." });
      finalOwnerId = "NPC_ASSOCIATION";
    } else if (registrationMode === "OTHER") {
      if (!targetId) return res.status(400).json({ error: "ID do usuário alvo é obrigatório." });
      finalOwnerId = normalizeId(targetId);
    }

    if (finalOwnerId !== "NPC_ASSOCIATION") {
      const { count } = await supabase
        .from("tc_fighters")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", finalOwnerId);
      if ((count || 0) >= 2)
        throw new Error(`Limite de 2 lutadores atingido para ${finalOwnerId}.`);
    }

    const safeName  = name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const fighterId = `${finalOwnerId}____${safeName}`;

    const newFighter: any = {
      id:           fighterId,
      owner_id:     finalOwnerId !== "NPC_ASSOCIATION" ? finalOwnerId : null,
      name,
      nen_type:     stats?.nenType || "Unknown",
      floor:        stats?.floor || 1,
      ranking:      stats?.floor ? 252 - stats.floor : 250,
      wins:         stats?.wins || 0,
      losses:       stats?.losses || 0,
      total_fights: stats?.total_fights || 0,
      popularity:   10,
      quotes_available: 1000,
      is_npc:       registrationMode === "NPC",
      image_url:    stats?.imageUrl?.trim() || `https://picsum.photos/seed/${encodeURIComponent(name)}/400/600`,
      quote_value:  0,
    };
    newFighter.quote_value = calculateQuoteValue(newFighter);

    const { error: fErr } = await supabase.from("tc_fighters").insert(newFighter);
    if (fErr) throw new Error(fErr.message);

    if (finalOwnerId !== "NPC_ASSOCIATION") {
      const { data: user } = await supabase.from("tc_users").select("user_type").eq("id", finalOwnerId).single();
      const newType = !user ? "FIGHTER" : user.user_type === "INVESTOR" ? "BOTH" : user.user_type;
      await supabase
        .from("tc_users")
        .upsert({ id: finalOwnerId, discord_id: finalOwnerId.replace("discord:", ""), username: name, name, user_type: newType, is_fighter: true })
        .eq("id", finalOwnerId);
    }

    await sendDiscordNotification(DISCORD_MATCH_WEBHOOK, {
      title: "🥊 NOVO LUTADOR REGISTRADO",
      description: `**${name}** entrou na arena!`,
      color: 3447003,
      fields: [
        { name: "Andar",   value: `${newFighter.floor}`,    inline: true },
        { name: "Nen",     value: `${newFighter.nen_type}`, inline: true },
      ],
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, fighter: newFighter });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Update Fighter ───────────────────────────────────────────────────

app.patch("/api/v2/update-fighter/:id", async (req, res) => {
  const { id } = req.params;
  const { name, floor, level, nenType, imageUrl, popularity } = req.body;

  try {
    const { data: f } = await supabase.from("tc_fighters").select("*").eq("id", id).single();
    if (!f) return res.status(404).json({ error: "Lutador não encontrado." });

    const updates: any = {};
    if (name       !== undefined) updates.name       = name;
    if (floor      !== undefined) updates.floor      = floor;
    if (level      !== undefined) updates.level      = level;
    if (nenType    !== undefined) updates.nen_type   = nenType;
    if (imageUrl   !== undefined) updates.image_url  = imageUrl;
    if (popularity !== undefined) updates.popularity = popularity;

    updates.quote_value = calculateQuoteValue({ ...f, ...updates });

    await supabase.from("tc_fighters").update(updates).eq("id", id);
    res.json({ success: true, updates });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Delete Fighter ───────────────────────────────────────────────────

app.delete("/api/v2/delete-fighter/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { data: f } = await supabase.from("tc_fighters").select("*").eq("id", id).single();
    if (!f) return res.status(404).json({ error: "Lutador não encontrado." });

    // tc_quotes tem ON DELETE CASCADE — apaga automaticamente
    await supabase.from("tc_fighters").delete().eq("id", id);

    if (f.owner_id) {
      await supabase
        .from("tc_users")
        .update({ is_fighter: false, user_type: "INVESTOR" })
        .eq("id", f.owner_id);
    }

    await sendDiscordNotification(DISCORD_MATCH_WEBHOOK, {
      title: "🚫 LUTADOR EXPULSO",
      description: `**${f.name}** foi removido da arena.`,
      color: 16711680,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Record Fight ─────────────────────────────────────────────────────

app.post("/api/v2/record-fight", async (req, res) => {
  const { fighterAId, fighterBId, winnerId } = req.body;
  if (!fighterAId || !fighterBId || !winnerId)
    return res.status(400).json({ error: "Dados incompletos." });

  try {
    const [{ data: fA }, { data: fB }] = await Promise.all([
      supabase.from("tc_fighters").select("*").eq("id", fighterAId).single(),
      supabase.from("tc_fighters").select("*").eq("id", fighterBId).single(),
    ]);
    if (!fA || !fB) throw new Error("Lutador não encontrado.");

    // Detecta loop e registra luta via função SQL atômica
    const { data: fightResult, error: fErr } = await supabase.rpc("tc_record_fight", {
      p_fighter_a_id: fighterAId,
      p_fighter_b_id: fighterBId,
      p_winner_id:    winnerId,
      p_is_npc:       false,
    });
    if (fErr) throw new Error(fErr.message);

    const penaltyMult = fightResult.penalty ?? 1;
    const isAWinner = winnerId === fighterAId;

    const newA = processFighterUpdate(fA, isAWinner,  penaltyMult);
    const newB = processFighterUpdate(fB, !isAWinner, penaltyMult);

    await Promise.all([
      supabase.from("tc_fighters").update(newA).eq("id", fighterAId),
      supabase.from("tc_fighters").update(newB).eq("id", fighterBId),
    ]);

    await sendDiscordNotification(DISCORD_MATCH_WEBHOOK, {
      title:       "🏁 RESULTADO DE COMBATE",
      description: `**${fA.name}** vs **${fB.name}** finalizado!`,
      color:       0x4CAF50,
      fields: [
        { name: "🏆 VENCEDOR", value: isAWinner ? fA.name : fB.name, inline: true },
        { name: "💀 DERROTADO", value: isAWinner ? fB.name : fA.name, inline: true },
      ],
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Deposit ──────────────────────────────────────────────────────────

app.post("/api/v2/deposit", async (req, res) => {
  const { userId, amountBRL } = req.body;
  if (!userId || !amountBRL || amountBRL < 0.5)
    return res.status(400).json({ error: "Valor mínimo R$ 0,50." });

  const uid = normalizeId(userId);

  try {
    const { data: user } = await supabase.from("tc_users").select("username").eq("id", uid).single();
    if (!user) throw new Error("Usuário não encontrado.");

    const amountTC = Math.floor(amountBRL * 100);
    const { data: pending, error } = await supabase.from("tc_pending_transactions").insert({
      user_id:     uid,
      user_name:   user.username,
      type:        "deposit",
      amount_reais: parseFloat(amountBRL),
      amount_tc:   amountTC,
      status:      "pending",
    }).select().single();

    if (error) throw new Error(error.message);

    await supabase.from("tc_notifications").insert({
      user_id: normalizeId(SUPER_ADMIN_ID),
      type:    "deposit_request",
      message: `${user.username} solicitou R$ ${parseFloat(amountBRL).toFixed(2)}.`,
      metadata: { pending_tx_id: pending.id },
    });

    sendDiscordNotification(DISCORD_FINANCE_WEBHOOK, {
      title: "🟡 FINANCEIRO: NOVO DEPÓSITO",
      description: `**${user.username}** solicitou depósito.`,
      color: 0xFFA500,
      fields: [
        { name: "R$",     value: `R$ ${parseFloat(amountBRL).toFixed(2)}`, inline: true },
        { name: "TC",     value: `${amountTC} TC`,                          inline: true },
      ],
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, pendingTxId: pending.id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Withdraw ─────────────────────────────────────────────────────────

app.post("/api/v2/withdraw", async (req, res) => {
  const { userId, amountCoins, method, details } = req.body;
  if (!userId || !amountCoins || amountCoins < 100)
    return res.status(400).json({ error: "Mínimo 100 Coins." });

  const uid = normalizeId(userId);

  try {
    const { data: user } = await supabase.from("tc_users").select("*").eq("id", uid).single();
    if (!user) throw new Error("Usuário não encontrado.");

    if (method !== "CHARACTER" && amountCoins > (user.released_balance || 0))
      throw new Error(`Saldo liberado insuficiente (${user.released_balance} TC).`);
    if (user.coins_balance < amountCoins)
      throw new Error("Saldo total insuficiente.");

    // Congela o saldo imediatamente
    await supabase.from("tc_users").update({
      coins_balance:    user.coins_balance - amountCoins,
      released_balance: Math.max(0, (user.released_balance || 0) - (method !== "CHARACTER" ? amountCoins : 0)),
    }).eq("id", uid);

    const { data: pending, error } = await supabase.from("tc_pending_transactions").insert({
      user_id:   uid,
      user_name: user.username,
      type:      "withdraw",
      amount_reais: amountCoins / 100,
      amount_tc: amountCoins,
      method,
      details,
      status:    "pending",
    }).select().single();

    if (error) throw new Error(error.message);

    await supabase.from("tc_notifications").insert({
      user_id: normalizeId(SUPER_ADMIN_ID),
      type:    "withdraw_request",
      message: `${user.username} solicitou saque de ${amountCoins} TC.`,
      metadata: { pending_tx_id: pending.id },
    });

    sendDiscordNotification(DISCORD_FINANCE_WEBHOOK, {
      title: "🔴 FINANCEIRO: SAQUE SOLICITADO",
      description: `**${user.username}** solicitou resgate.`,
      color: 0xFF0000,
      fields: [
        { name: "TC",     value: `${amountCoins} TC`, inline: true },
        { name: "Método", value: method,              inline: true },
      ],
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, pendingTxId: pending.id });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: Process Transaction ────────────────────────────────────────

app.post("/api/v2/admin/process-transaction", async (req, res) => {
  const { txId, action, adminId, reason } = req.body;
  if (!await isAdminUser(adminId))
    return res.status(403).json({ error: "Acesso administrativo negado." });

  try {
    const { data, error } = await supabase.rpc("tc_process_pending_tx", {
      p_tx_id:    txId,
      p_action:   action.toLowerCase(), // 'approve' | 'reject'
      p_admin_id: normalizeId(adminId),
      p_reason:   reason || null,
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Update Phone ─────────────────────────────────────────────────────

app.post("/api/v2/update-phone", async (req, res) => {
  const { userId, phone } = req.body;
  if (!userId || !phone) return res.status(400).json({ error: "Dados incompletos." });

  try {
    await supabase.from("tc_users").update({ phone }).eq("id", normalizeId(userId));
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Market Analysis ──────────────────────────────────────────────────

app.get("/api/v2/market-analysis/:fighterId", async (req, res) => {
  const { fighterId } = req.params;
  try {
    const { data: f } = await supabase.from("tc_fighters").select("*").eq("id", fighterId).single();
    if (!f) return res.status(404).json({ error: "Lutador não encontrado." });

    const ratio = (f.owner_buy_volume_24h || 0) / (f.volume_buy_24h || 1);
    res.json({
      id:          fighterId,
      auto_pump:   ratio > 0.5,
      owner_ratio: ratio,
      message:     ratio > 0.5
        ? "ALERTA: Auto-Pump detectado. Valorização limitada até diluição orgânica."
        : "Atividade de mercado saudável.",
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Sanction Match (webhook) ─────────────────────────────────────────

app.post("/api/v2/sanction-match", async (req, res) => {
  const { webhookUrl, fighterA, fighterB, floor, mentionRoles, judgeName } = req.body;
  if (!webhookUrl || !fighterA || !fighterB)
    return res.status(400).json({ error: "Dados incompletos." });

  try {
    const COMPETITOR_ROLE = "1100984179845505044";
    const competitorMentions = [fighterA.user_id, fighterB.user_id]
      .filter(id => id && id !== "NPC_ASSOCIATION")
      .map(id => `<@${id.replace("discord:", "")}>`)
      .join(" ");

    const mention = mentionRoles && mentionRoles !== "@everyone"
      ? `${mentionRoles} ${competitorMentions}`.trim()
      : `<@&${COMPETITOR_ROLE}> ${competitorMentions}`.trim();

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: mention,
        embeds: [{
          title: "⚡ LUTA SANCIONADA NA TORRE CELESTIAL ⚡",
          description: `Nova disputa no **Andar ${floor}**!`,
          color: 0x2196F3,
          fields: [
            { name: "🔴 COMPETIDOR A", value: `**${fighterA.name}**\n*(Ranking #${fighterA.ranking})*`, inline: true },
            { name: "🔵 COMPETIDOR B", value: `**${fighterB.name}**\n*(Ranking #${fighterB.ranking})*`, inline: true },
            { name: "⚖️ JUIZ",         value: judgeName,                                                inline: true },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── NPC Matchmaking ──────────────────────────────────────────────────

app.post("/api/v2/admin/npc-matchmaking", async (req, res) => {
  const { isAdmin: reqAdmin, userId, floorGroup } = req.body;
  const raw = userId?.startsWith("discord:") ? userId.replace("discord:", "") : userId;
  if (!reqAdmin || !(await isAdminUser(userId)) || raw !== SUPER_ADMIN_ID)
    return res.status(403).json({ error: "Acesso negado." });

  try {
    const { data: npcs } = await supabase
      .from("tc_fighters")
      .select("*")
      .eq("is_npc", true);

    if (!npcs?.length) return res.status(404).json({ error: "Nenhum NPC cadastrado." });

    const groups: Record<string, any[]> = {};
    npcs.forEach(npc => {
      const f = npc.floor || 1;
      const start = f < 10 ? 1 : Math.floor(f / 10) * 10;
      const key = `${start}-${start + (f < 10 ? 8 : 9)}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(npc);
    });

    let validGroups = Object.keys(groups).filter(k => groups[k].length >= 2);
    if (floorGroup) {
      if (!groups[floorGroup] || groups[floorGroup].length < 2)
        return res.status(400).json({ error: `Grupo ${floorGroup} insuficiente.` });
      validGroups = [floorGroup];
    }
    if (!validGroups.length) return res.status(400).json({ error: "Sem grupos válidos." });

    const grp = groups[validGroups[Math.floor(Math.random() * validGroups.length)]];
    let idxA = Math.floor(Math.random() * grp.length);
    let idxB = Math.floor(Math.random() * grp.length);
    while (idxA === idxB) idxB = Math.floor(Math.random() * grp.length);

    const fA = grp[idxA], fB = grp[idxB];

    let chanceA = 50;
    const wrA = (fA.wins || 0) / (fA.total_fights || 1);
    const wrB = (fB.wins || 0) / (fB.total_fights || 1);
    if (wrA > wrB) chanceA += 5; else if (wrB > wrA) chanceA -= 5;
    if ((fA.total_fights || 0) > (fB.total_fights || 0)) chanceA += 5; else if ((fB.total_fights || 0) > (fA.total_fights || 0)) chanceA -= 5;

    const matchId = `npc_${Date.now()}`;
    const matchData = {
      id:               matchId,
      fighter1_id:      fA.id,
      fighter2_id:      fB.id,
      scheduled_at:     new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      status:           "pending",
      result:           { win_probability_a: chanceA, fighter_a_name: fA.name, fighter_b_name: fB.name },
    };

    await supabase.from("tc_npc_matches").insert(matchData);

    await fetch(DISCORD_MATCH_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: "🎰 LUTA NPC AGENDADA",
          description: `Combate em **${validGroups[0]}** em breve!`,
          color: 0xFFA000,
          fields: [
            { name: "🔴 A", value: `**${fA.name}**`, inline: true },
            { name: "🔵 B", value: `**${fB.name}**`, inline: true },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });

    res.json({ success: true, match: matchData });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Resolve NPC Matches ──────────────────────────────────────────────

app.post("/api/v2/admin/resolve-npc-matches", async (req, res) => {
  try {
    const { data: pending } = await supabase
      .from("tc_npc_matches")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_at", new Date().toISOString());

    if (!pending?.length) return res.json({ message: "Nenhum combate pendente." });

    const results = [];
    for (const match of pending) {
      const probA = match.result?.win_probability_a ?? 50;
      const winnerId = Math.random() * 100 <= probA ? match.fighter1_id : match.fighter2_id;
      const loserId  = winnerId === match.fighter1_id ? match.fighter2_id : match.fighter1_id;

      const [{ data: w }, { data: l }] = await Promise.all([
        supabase.from("tc_fighters").select("*").eq("id", winnerId).single(),
        supabase.from("tc_fighters").select("*").eq("id", loserId).single(),
      ]);

      if (w && l) {
        await Promise.all([
          supabase.from("tc_fighters").update(processFighterUpdate(w, true,  1)).eq("id", winnerId),
          supabase.from("tc_fighters").update(processFighterUpdate(l, false, 1)).eq("id", loserId),
        ]);
        await supabase.rpc("tc_record_fight", {
          p_fighter_a_id: match.fighter1_id,
          p_fighter_b_id: match.fighter2_id,
          p_winner_id:    winnerId,
          p_is_npc:       true,
        });
      }

      await supabase.from("tc_npc_matches").update({ status: "completed", result: { ...match.result, winner_id: winnerId } }).eq("id", match.id);

      await fetch(DISCORD_MATCH_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [{
          title: "🏁 RESULTADO NPC",
          color: 0x4CAF50,
          fields: [
            { name: "🏆", value: w?.name || winnerId, inline: true },
            { name: "💀", value: l?.name || loserId,  inline: true },
          ],
          timestamp: new Date().toISOString(),
        }]}),
      });

      results.push({ matchId: match.id, winner: w?.name || winnerId });
    }

    res.json({ success: true, processed: results });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── User Profile (leitura direta) ────────────────────────────────────

app.get("/api/v2/user/:userId", async (req, res) => {
  const uid = normalizeId(req.params.userId);
  try {
    const { data } = await supabase.from("tc_users").select("*").eq("id", uid).single();
    if (!data) return res.status(404).json({ error: "Usuário não encontrado." });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Transactions (leitura privada via service_role) ───────────────────

app.get("/api/v2/transactions/:userId", async (req, res) => {
  const uid = normalizeId(req.params.userId);
  try {
    const { data } = await supabase
      .from("tc_transactions")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(50);
    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Pending Transactions (apenas juízes) ────────────────────────────

app.get("/api/v2/pending-transactions", async (req, res) => {
  try {
    const { data } = await supabase
      .from("tc_pending_transactions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Notifications ────────────────────────────────────────────────────

app.get("/api/v2/notifications/:userId", async (req, res) => {
  const uid = normalizeId(req.params.userId);
  try {
    const { data } = await supabase
      .from("tc_notifications")
      .select("*")
      .eq("user_id", uid)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(10);
    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/v2/notifications/read", async (req, res) => {
  const { notificationIds } = req.body;
  if (!Array.isArray(notificationIds))
    return res.status(400).json({ error: "IDs inválidos." });
  try {
    await supabase.from("tc_notifications").update({ is_read: true }).in("id", notificationIds);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: Recalculate All ────────────────────────────────────────────

app.post("/api/v2/admin/recalculate-all-fighters", async (req, res) => {
  const { isAdmin: reqAdmin, userId } = req.body;
  if (!reqAdmin || !(await isAdminUser(userId)))
    return res.status(403).json({ error: "Acesso negado." });

  try {
    const { data: fighters } = await supabase.from("tc_fighters").select("*");
    if (!fighters?.length) return res.json({ message: "Nenhum lutador.", count: 0 });

    for (const f of fighters) {
      const comps = calculateQuoteValueComponents(f);
      await supabase.from("tc_fighters").update({
        quote_value:       comps.total,
        performance_value: comps.performance,
        market_value:      comps.market,
      }).eq("id", f.id);
    }

    res.json({ message: `${fighters.length} lutadores atualizados.`, count: fighters.length });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: Clear Arena ────────────────────────────────────────────────

app.post("/api/v2/admin/clear-v2-data", async (req, res) => {
  const { isAdmin: reqAdmin, userId } = req.body;
  const raw = userId?.startsWith("discord:") ? userId.replace("discord:", "") : userId;
  if (!reqAdmin || !(await isAdminUser(userId)) || raw !== SUPER_ADMIN_ID)
    return res.status(403).json({ error: "Restrito ao Administrador Máximo." });

  try {
    await supabase.from("tc_quotes").delete().neq("fighter_id", "__never__");
    await supabase.from("tc_fights").delete().neq("id", "__never__");
    await supabase.from("tc_transactions").delete().neq("id", "__never__");
    await supabase.from("tc_fighters").delete().neq("id", "__never__");
    await supabase.from("tc_users").update({ user_type: "INVESTOR", is_fighter: false }).neq("id", "__never__");

    res.json({ success: true, message: "Arena V2 reiniciada com sucesso." });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: Backup / Restore ───────────────────────────────────────────

app.post("/api/v2/admin/backup", async (req, res) => {
  const { slot, userId } = req.body;
  if (!(await isAdminUser(userId))) return res.status(403).json({ error: "Acesso negado." });

  try {
    const { data: fighters } = await supabase.from("tc_fighters").select("*");
    await supabase.from("tc_backups").upsert({
      id:         `slot_${slot}`,
      fighters:   fighters || [],
      created_by: normalizeId(userId),
    });
    res.json({ success: true, slot });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/v2/admin/restore", async (req, res) => {
  const { slot, userId } = req.body;
  if (!(await isAdminUser(userId))) return res.status(403).json({ error: "Acesso negado." });

  try {
    const { data: backup } = await supabase
      .from("tc_backups").select("fighters").eq("id", `slot_${slot}`).single();
    if (!backup) return res.status(404).json({ error: "Backup não encontrado." });

    await supabase.from("tc_fighters").delete().neq("id", "__never__");

    for (const f of backup.fighters as any[]) {
      const { id, ...data } = f;
      await supabase.from("tc_fighters").insert({ id, ...data });
    }

    res.json({ success: true, slot });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Debug ─────────────────────────────────────────────────────────────

app.get("/api/v2/debug-db", async (req, res) => {
  try {
    const tables = ["tc_users","tc_fighters","tc_quotes","tc_fights","tc_transactions","tc_notifications"];
    const counts: Record<string, number> = {};
    for (const t of tables) {
      const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
      counts[t] = count || 0;
    }
    res.json({ ok: true, database: "supabase", counts });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════════
// SERVIR FRONTEND
// ════════════════════════════════════════════════════════════

const isVercel = !!process.env.VERCEL;
const isProd   = process.env.NODE_ENV === "production" || isVercel;

if (!isVercel) {
  if (isProd) {
    const dist = path.resolve(process.cwd(), "dist");
    if (fs.existsSync(dist)) {
      app.use(express.static(dist));
      app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
    }
  } else {
    import("vite").then(mod =>
      mod.createServer({ server: { middlewareMode: true }, appType: "spa" })
         .then(vite => app.use(vite.middlewares))
    ).catch(() => {});
  }
}

export default app;

if (!isVercel) {
  app.listen(3000, "0.0.0.0", () => console.log("[TORRE] Servidor rodando na porta 3000"));
}
