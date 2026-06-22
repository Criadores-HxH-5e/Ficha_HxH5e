-- ══════════════════════════════════════════════════════════
-- Torre Celestial — Schema V2
-- Migração 001: Criação das tabelas base
--
-- Estratégia de segurança:
--   Leituras: anon key direto do frontend (RLS permissiva para dados públicos)
--   Escritas financeiras: apenas via backend Express com service_role key
--   Nunca expor service_role no frontend.
-- ══════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────
-- USUÁRIOS
-- id = "discord:" + discord_id (ex: "discord:123456789")
-- Espelha o user_id usado na tabela `characters` do HxH5e
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tc_users (
  id                TEXT PRIMARY KEY,          -- "discord:XXXXXXXXX"
  discord_id        TEXT UNIQUE NOT NULL,
  username          TEXT NOT NULL,
  avatar            TEXT,
  coins_balance     BIGINT NOT NULL DEFAULT 0 CHECK (coins_balance >= 0),
  released_balance  BIGINT NOT NULL DEFAULT 0 CHECK (released_balance >= 0),
  is_admin          BOOLEAN NOT NULL DEFAULT FALSE,
  is_judge          BOOLEAN NOT NULL DEFAULT FALSE,
  is_investor       BOOLEAN NOT NULL DEFAULT FALSE,
  discord_roles     TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT released_lte_coins CHECK (released_balance <= coins_balance)
);

-- ──────────────────────────────────────────────────────────
-- LUTADORES
-- Um lutador é um personagem registrado na arena.
-- owner_id referencia tc_users (o dono do personagem).
-- Pode ser NPC (owner_id NULL).
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tc_fighters (
  id                    TEXT PRIMARY KEY,        -- "discord:XXXXXXXXX" ou "npc:NOME"
  name                  TEXT NOT NULL,
  nen_type              TEXT NOT NULL,           -- Reforço | Transmutação | Emissão | Conjuração | Manipulação | Especialização
  floor                 INT NOT NULL DEFAULT 1 CHECK (floor BETWEEN 1 AND 251),
  ranking               INT,
  wins                  INT NOT NULL DEFAULT 0 CHECK (wins >= 0),
  losses                INT NOT NULL DEFAULT 0 CHECK (losses >= 0),
  draws                 INT NOT NULL DEFAULT 0 CHECK (draws >= 0),
  streak                INT NOT NULL DEFAULT 0,  -- positivo = sequência de vitórias, negativo = derrotas
  popularity            INT NOT NULL DEFAULT 0 CHECK (popularity BETWEEN 0 AND 100),
  quote_value           INT NOT NULL DEFAULT 50 CHECK (quote_value >= 20),
  quote_value_components JSONB,                  -- breakdown do cálculo (ranking, performance, streak, floor, etc.)
  total_quotes_issued   INT NOT NULL DEFAULT 0 CHECK (total_quotes_issued >= 0),
  volume_buy_24h        INT NOT NULL DEFAULT 0 CHECK (volume_buy_24h >= 0),
  volume_sell_24h       INT NOT NULL DEFAULT 0 CHECK (volume_sell_24h >= 0),
  owner_buy_volume_24h  INT NOT NULL DEFAULT 0 CHECK (owner_buy_volume_24h >= 0),
  image_url             TEXT,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  is_floor_master       BOOLEAN NOT NULL DEFAULT FALSE,
  is_npc                BOOLEAN NOT NULL DEFAULT FALSE,
  last_fight_at         TIMESTAMPTZ,
  inactivity_penalty_pct INT NOT NULL DEFAULT 0 CHECK (inactivity_penalty_pct BETWEEN 0 AND 50),
  owner_id              TEXT REFERENCES tc_users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- COTAS (posições dos investidores em cada lutador)
-- Chave composta: (fighter_id, user_id) — equivale ao
-- Firestore "v2_quotes/{fighterId}____{userId}"
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tc_quotes (
  fighter_id      TEXT NOT NULL REFERENCES tc_fighters(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES tc_users(id) ON DELETE CASCADE,
  quantity        INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  avg_buy_price   INT,                           -- preço médio de compra (TC Coin)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (fighter_id, user_id)
);

-- ──────────────────────────────────────────────────────────
-- LUTAS (imutável — ledger de combates)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tc_fights (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  fighter1_id   TEXT NOT NULL REFERENCES tc_fighters(id),
  fighter2_id   TEXT NOT NULL REFERENCES tc_fighters(id),
  winner_id     TEXT REFERENCES tc_fighters(id),    -- NULL = empate
  floor         INT NOT NULL,
  prize_money   INT NOT NULL DEFAULT 0,
  judge_id      TEXT REFERENCES tc_users(id),
  is_npc_fight  BOOLEAN NOT NULL DEFAULT FALSE,
  metadata      JSONB,                              -- dados extras (narrativa, stakes, etc.)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT different_fighters CHECK (fighter1_id <> fighter2_id)
);

-- ──────────────────────────────────────────────────────────
-- TRANSAÇÕES (imutável — ledger financeiro)
-- amount positivo = crédito, negativo = débito
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tc_transactions (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id          TEXT NOT NULL REFERENCES tc_users(id),
  type             TEXT NOT NULL,                  -- 'buy_quote' | 'sell_quote' | 'fight_prize' | 'deposit' | 'withdraw' | 'bonus' | 'weekly_scholarship'
  amount           BIGINT NOT NULL,
  balance_after    BIGINT NOT NULL,
  released_after   BIGINT NOT NULL,
  metadata         JSONB,                          -- fighter_id, quantity, fight_id, etc.
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- TRANSAÇÕES PENDENTES (depósitos e saques aguardando aprovação)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tc_pending_transactions (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT NOT NULL REFERENCES tc_users(id),
  type            TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw')),
  amount_reais    NUMERIC(10, 2) NOT NULL CHECK (amount_reais > 0),
  amount_tc       BIGINT NOT NULL CHECK (amount_tc > 0),  -- amount_reais × 100
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  pix_key         TEXT,
  receipt_url     TEXT,
  admin_id        TEXT REFERENCES tc_users(id),
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- NOTIFICAÇÕES IN-APP
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tc_notifications (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT NOT NULL REFERENCES tc_users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,                       -- 'fight_result' | 'quote_sold' | 'deposit_approved' | etc.
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- LUTAS NPC AGENDADAS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tc_npc_matches (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  fighter1_id   TEXT NOT NULL REFERENCES tc_fighters(id),
  fighter2_id   TEXT NOT NULL REFERENCES tc_fighters(id),
  scheduled_at  TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  result        JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────
-- ATIVIDADE SUSPEITA (match-loop, pump attempts)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tc_suspicious_activity (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  fighter_id  TEXT REFERENCES tc_fighters(id),
  user_id     TEXT REFERENCES tc_users(id),
  type        TEXT NOT NULL,                       -- 'match_loop' | 'pump_attempt' | 'wash_trading'
  details     JSONB,
  resolved    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════
-- ÍNDICES
-- ══════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_tc_fighters_owner        ON tc_fighters(owner_id);
CREATE INDEX IF NOT EXISTS idx_tc_fighters_floor        ON tc_fighters(floor);
CREATE INDEX IF NOT EXISTS idx_tc_fighters_ranking      ON tc_fighters(ranking);
CREATE INDEX IF NOT EXISTS idx_tc_fighters_active       ON tc_fighters(is_active);
CREATE INDEX IF NOT EXISTS idx_tc_quotes_user           ON tc_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_tc_quotes_fighter        ON tc_quotes(fighter_id);
CREATE INDEX IF NOT EXISTS idx_tc_fights_fighter1       ON tc_fights(fighter1_id);
CREATE INDEX IF NOT EXISTS idx_tc_fights_fighter2       ON tc_fights(fighter2_id);
CREATE INDEX IF NOT EXISTS idx_tc_fights_created        ON tc_fights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tc_transactions_user     ON tc_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_tc_transactions_created  ON tc_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tc_notifications_user    ON tc_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_tc_pending_status        ON tc_pending_transactions(status);
CREATE INDEX IF NOT EXISTS idx_tc_suspicious_resolved   ON tc_suspicious_activity(resolved);

-- ══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
--
-- Filosofia: leituras abertas para dados de mercado (lutadores,
-- cotas, ranking). Dados pessoais (saldo, notificações,
-- transações) exigem que o frontend passe um header
-- x-discord-id que o backend validou via JWT customizado.
--
-- Por ora: RLS ativado mas com política permissiva para
-- leituras (anon pode ler). Escritas BLOQUEADAS para anon —
-- apenas service_role (backend) pode escrever.
-- ══════════════════════════════════════════════════════════

ALTER TABLE tc_users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_fighters             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_quotes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_fights               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_transactions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_pending_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_npc_matches          ENABLE ROW LEVEL SECURITY;
ALTER TABLE tc_suspicious_activity  ENABLE ROW LEVEL SECURITY;

-- Dados de mercado: leitura pública, escrita apenas service_role
CREATE POLICY "tc_fighters_read"  ON tc_fighters             FOR SELECT USING (TRUE);
CREATE POLICY "tc_quotes_read"    ON tc_quotes               FOR SELECT USING (TRUE);
CREATE POLICY "tc_fights_read"    ON tc_fights               FOR SELECT USING (TRUE);
CREATE POLICY "tc_npc_read"       ON tc_npc_matches          FOR SELECT USING (TRUE);

-- Dados de usuário: leitura pública (username, avatar),
-- escrita bloqueada — só service_role
CREATE POLICY "tc_users_read"     ON tc_users                FOR SELECT USING (TRUE);

-- Dados privados: leitura bloqueada para anon — frontend
-- sempre busca via API que usa service_role
-- (sem política = nenhum acesso pela anon key)

-- Nota: service_role bypassa RLS por padrão no Supabase,
-- então o backend Express com service_role key tem acesso total.

-- ══════════════════════════════════════════════════════════
-- FUNÇÃO: updated_at automático
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tc_users_updated_at
  BEFORE UPDATE ON tc_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tc_fighters_updated_at
  BEFORE UPDATE ON tc_fighters
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tc_quotes_updated_at
  BEFORE UPDATE ON tc_quotes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tc_pending_updated_at
  BEFORE UPDATE ON tc_pending_transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ══════════════════════════════════════════════════════════
-- FUNÇÃO: compra de cota (atômica)
-- Garante que saldo, cotas e transação sejam atualizados
-- numa única transação PostgreSQL — equivale ao
-- runTransaction() do Firebase.
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION tc_buy_quote(
  p_user_id    TEXT,
  p_fighter_id TEXT,
  p_quantity   INT,
  p_unit_price INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- executa como owner (service_role), não como caller
AS $$
DECLARE
  v_cost          BIGINT;
  v_user          tc_users%ROWTYPE;
  v_new_balance   BIGINT;
  v_new_released  BIGINT;
  v_existing_qty  INT;
  v_new_qty       INT;
  v_new_avg       INT;
  v_tx_id         TEXT;
BEGIN
  v_cost := p_quantity::BIGINT * p_unit_price;

  -- Trava o usuário para evitar race condition
  SELECT * INTO v_user FROM tc_users WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Usuário não encontrado');
  END IF;

  IF v_user.coins_balance < v_cost THEN
    RETURN jsonb_build_object('error', 'Saldo insuficiente');
  END IF;

  -- Atualiza saldo
  v_new_balance  := v_user.coins_balance - v_cost;
  v_new_released := LEAST(v_user.released_balance, v_new_balance);

  UPDATE tc_users
    SET coins_balance = v_new_balance, released_balance = v_new_released
  WHERE id = p_user_id;

  -- Upsert na posição de cotas
  SELECT quantity INTO v_existing_qty
    FROM tc_quotes WHERE fighter_id = p_fighter_id AND user_id = p_user_id;

  IF v_existing_qty IS NULL THEN
    v_new_qty := p_quantity;
    v_new_avg := p_unit_price;
    INSERT INTO tc_quotes (fighter_id, user_id, quantity, avg_buy_price)
      VALUES (p_fighter_id, p_user_id, v_new_qty, v_new_avg);
  ELSE
    v_new_qty := v_existing_qty + p_quantity;
    v_new_avg := ((v_existing_qty * COALESCE(
                    (SELECT avg_buy_price FROM tc_quotes
                     WHERE fighter_id = p_fighter_id AND user_id = p_user_id), p_unit_price
                  )) + (p_quantity * p_unit_price)) / v_new_qty;
    UPDATE tc_quotes
      SET quantity = v_new_qty, avg_buy_price = v_new_avg
    WHERE fighter_id = p_fighter_id AND user_id = p_user_id;
  END IF;

  -- Atualiza volume do lutador
  UPDATE tc_fighters
    SET total_quotes_issued = total_quotes_issued + p_quantity,
        volume_buy_24h      = volume_buy_24h + p_quantity,
        updated_at          = NOW()
  WHERE id = p_fighter_id;

  -- Registra transação
  v_tx_id := gen_random_uuid()::TEXT;
  INSERT INTO tc_transactions (id, user_id, type, amount, balance_after, released_after, metadata)
    VALUES (
      v_tx_id, p_user_id, 'buy_quote', -v_cost,
      v_new_balance, v_new_released,
      jsonb_build_object(
        'fighter_id', p_fighter_id,
        'quantity',   p_quantity,
        'unit_price', p_unit_price
      )
    );

  RETURN jsonb_build_object('ok', TRUE, 'tx_id', v_tx_id, 'new_balance', v_new_balance);
END;
$$;

-- ══════════════════════════════════════════════════════════
-- FUNÇÃO: venda de cota (atômica)
-- ══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION tc_sell_quote(
  p_user_id    TEXT,
  p_fighter_id TEXT,
  p_quantity   INT,
  p_unit_price INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_proceeds      BIGINT;
  v_user          tc_users%ROWTYPE;
  v_quote         tc_quotes%ROWTYPE;
  v_new_balance   BIGINT;
  v_new_released  BIGINT;
  v_new_qty       INT;
  v_tx_id         TEXT;
  v_profit        BIGINT;
BEGIN
  v_proceeds := p_quantity::BIGINT * p_unit_price;

  SELECT * INTO v_user  FROM tc_users  WHERE id = p_user_id  FOR UPDATE;
  SELECT * INTO v_quote FROM tc_quotes WHERE fighter_id = p_fighter_id AND user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Posição não encontrada');
  END IF;

  IF v_quote.quantity < p_quantity THEN
    RETURN jsonb_build_object('error', 'Cotas insuficientes');
  END IF;

  v_new_balance  := v_user.coins_balance + v_proceeds;

  -- Lucro real vai para released_balance; custo base mantém bloqueado
  v_profit := GREATEST(0, (p_unit_price - COALESCE(v_quote.avg_buy_price, 0))::BIGINT * p_quantity);
  v_new_released := v_user.released_balance + v_profit;

  UPDATE tc_users
    SET coins_balance = v_new_balance, released_balance = v_new_released
  WHERE id = p_user_id;

  v_new_qty := v_quote.quantity - p_quantity;

  IF v_new_qty = 0 THEN
    DELETE FROM tc_quotes WHERE fighter_id = p_fighter_id AND user_id = p_user_id;
  ELSE
    UPDATE tc_quotes SET quantity = v_new_qty WHERE fighter_id = p_fighter_id AND user_id = p_user_id;
  END IF;

  UPDATE tc_fighters
    SET volume_sell_24h = volume_sell_24h + p_quantity,
        updated_at      = NOW()
  WHERE id = p_fighter_id;

  v_tx_id := gen_random_uuid()::TEXT;
  INSERT INTO tc_transactions (id, user_id, type, amount, balance_after, released_after, metadata)
    VALUES (
      v_tx_id, p_user_id, 'sell_quote', v_proceeds,
      v_new_balance, v_new_released,
      jsonb_build_object(
        'fighter_id', p_fighter_id,
        'quantity',   p_quantity,
        'unit_price', p_unit_price,
        'profit',     v_profit
      )
    );

  RETURN jsonb_build_object('ok', TRUE, 'tx_id', v_tx_id, 'new_balance', v_new_balance);
END;
$$;
