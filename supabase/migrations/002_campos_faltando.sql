-- ══════════════════════════════════════════════════════════
-- Migração 002: Campos que faltaram na migração inicial,
-- identificados ao analisar o api/index.ts original.
-- ══════════════════════════════════════════════════════════

-- ── tc_users: campos extras do sistema original ───────────
ALTER TABLE tc_users
  ADD COLUMN IF NOT EXISTS name            TEXT,
  ADD COLUMN IF NOT EXISTS user_type       TEXT NOT NULL DEFAULT 'INVESTOR'
                                               CHECK (user_type IN ('INVESTOR','FIGHTER','BOTH')),
  ADD COLUMN IF NOT EXISTS is_fighter      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone           TEXT,
  ADD COLUMN IF NOT EXISTS last_activity   TIMESTAMPTZ;

-- ── tc_fighters: campos extras do sistema original ────────
ALTER TABLE tc_fighters
  ADD COLUMN IF NOT EXISTS quotes_available    INT NOT NULL DEFAULT 1000
                                                   CHECK (quotes_available >= 0),
  ADD COLUMN IF NOT EXISTS total_fights        INT NOT NULL DEFAULT 0
                                                   CHECK (total_fights >= 0),
  ADD COLUMN IF NOT EXISTS performance_value   NUMERIC,
  ADD COLUMN IF NOT EXISTS market_value        NUMERIC,
  ADD COLUMN IF NOT EXISTS price_24h_ago       INT,
  ADD COLUMN IF NOT EXISTS last_match_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_scholarship_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS jenny_blocked       INT NOT NULL DEFAULT 0
                                                   CHECK (jenny_blocked >= 0);

-- ── tc_quotes: campo de lutas desde a compra ──────────────
ALTER TABLE tc_quotes
  ADD COLUMN IF NOT EXISTS released_principal        NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS entry_performance_avg     NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS entry_market_avg          NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS initial_matches           INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS lutas_ocorridas_desde_compra INT NOT NULL DEFAULT 0;

-- ── tc_pending_transactions: campos extras ────────────────
ALTER TABLE tc_pending_transactions
  ADD COLUMN IF NOT EXISTS user_name  TEXT,
  ADD COLUMN IF NOT EXISTS method     TEXT,  -- 'PIX' | 'CHARACTER'
  ADD COLUMN IF NOT EXISTS details    JSONB;

-- ── tc_notifications: campo 'read' (alias de is_read) ─────
-- O sistema original usava 'read', padronizamos para 'is_read'.
-- is_read já existe na tabela, nenhuma alteração necessária.

-- ── tc_fights: campos extras ──────────────────────────────
ALTER TABLE tc_fights
  ADD COLUMN IF NOT EXISTS impact_ranking    INT,
  ADD COLUMN IF NOT EXISTS impact_popularity INT,
  ADD COLUMN IF NOT EXISTS fighter_a_id      TEXT,  -- alias de fighter1_id para compatibilidade
  ADD COLUMN IF NOT EXISTS fighter_b_id      TEXT,  -- alias de fighter2_id para compatibilidade
  ADD COLUMN IF NOT EXISTS type              TEXT DEFAULT 'MANUAL';

-- ── tc_backups: nova tabela para backup/restore ───────────
CREATE TABLE IF NOT EXISTS tc_backups (
  id          TEXT PRIMARY KEY,
  fighters    JSONB NOT NULL,
  created_by  TEXT REFERENCES tc_users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tc_backups ENABLE ROW LEVEL SECURITY;

-- ── FUNÇÃO ATÔMICA: registrar luta ────────────────────────
-- Equivale ao runTransaction() do record-fight no Firebase.
CREATE OR REPLACE FUNCTION tc_record_fight(
  p_fighter_a_id  TEXT,
  p_fighter_b_id  TEXT,
  p_winner_id     TEXT,
  p_judge_id      TEXT DEFAULT NULL,
  p_is_npc        BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_fight_id          TEXT;
  v_recent_count      INT;
  v_penalty           NUMERIC;
BEGIN
  -- Detecta match-loop: quantas lutas recentes entre esses dois?
  SELECT COUNT(*) INTO v_recent_count
    FROM tc_fights
   WHERE created_at > NOW() - INTERVAL '24 hours'
     AND (
       (fighter1_id = p_fighter_a_id AND fighter2_id = p_fighter_b_id) OR
       (fighter1_id = p_fighter_b_id AND fighter2_id = p_fighter_a_id)
     );

  v_penalty := GREATEST(0, 1 - v_recent_count * 0.4);

  IF v_recent_count >= 3 THEN
    INSERT INTO tc_suspicious_activity (fighter_id, user_id, type, details)
    VALUES (p_fighter_a_id, NULL, 'match_loop', jsonb_build_object(
      'fighter_b_id', p_fighter_b_id, 'count', v_recent_count
    ));
  END IF;

  -- Registra a luta
  v_fight_id := gen_random_uuid()::TEXT;
  INSERT INTO tc_fights (
    id, fighter1_id, fighter2_id, fighter_a_id, fighter_b_id,
    winner_id, floor, judge_id, is_npc_fight, type,
    impact_ranking, impact_popularity
  )
  SELECT
    v_fight_id,
    p_fighter_a_id, p_fighter_b_id,
    p_fighter_a_id, p_fighter_b_id,
    p_winner_id,
    COALESCE(fa.floor, 1),
    p_judge_id,
    p_is_npc,
    CASE WHEN p_is_npc THEN 'NPC_AUTO' ELSE 'MANUAL' END,
    5, 5
  FROM tc_fighters fa WHERE fa.id = p_fighter_a_id;

  -- Incrementa lutas_ocorridas_desde_compra para todos os investidores
  UPDATE tc_quotes
     SET lutas_ocorridas_desde_compra = lutas_ocorridas_desde_compra + 1
   WHERE fighter_id IN (p_fighter_a_id, p_fighter_b_id);

  RETURN jsonb_build_object(
    'ok', TRUE,
    'fight_id', v_fight_id,
    'penalty', v_penalty,
    'recent_count', v_recent_count
  );
END;
$$;

-- ── FUNÇÃO ATÔMICA: processar transação pendente ──────────
CREATE OR REPLACE FUNCTION tc_process_pending_tx(
  p_tx_id    TEXT,
  p_action   TEXT,  -- 'APPROVE' | 'REJECT'
  p_admin_id TEXT,
  p_reason   TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tx        tc_pending_transactions%ROWTYPE;
  v_user      tc_users%ROWTYPE;
  v_net       BIGINT;
BEGIN
  SELECT * INTO v_tx FROM tc_pending_transactions WHERE id = p_tx_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('error', 'Transação não encontrada'); END IF;
  IF v_tx.status <> 'pending' THEN RETURN jsonb_build_object('error', 'Transação já processada'); END IF;

  SELECT * INTO v_user FROM tc_users WHERE id = v_tx.user_id FOR UPDATE;

  IF p_action = 'APPROVE' THEN
    IF v_tx.type = 'deposit' THEN
      UPDATE tc_users
         SET coins_balance    = coins_balance + v_tx.amount_tc,
             released_balance = released_balance + v_tx.amount_tc,
             updated_at       = NOW()
       WHERE id = v_tx.user_id;

      INSERT INTO tc_transactions (user_id, type, amount, balance_after, released_after, metadata)
      VALUES (
        v_tx.user_id, 'deposit', v_tx.amount_tc,
        v_user.coins_balance + v_tx.amount_tc,
        v_user.released_balance + v_tx.amount_tc,
        jsonb_build_object('approved_by', p_admin_id, 'pending_tx_id', p_tx_id)
      );

    ELSIF v_tx.type = 'withdraw' THEN
      -- Saldo já foi deduzido na criação do pedido
      IF v_tx.method = 'CHARACTER' AND v_tx.details->>'character_id' IS NOT NULL THEN
        v_net := FLOOR(v_tx.amount_tc * 0.85);
        UPDATE characters
           SET data = jsonb_set(
                 jsonb_set(data, '{jenny}',
                   to_jsonb(COALESCE((data->>'jenny')::numeric, 0) + v_net)),
                 '{totalEarnings}',
                   to_jsonb(COALESCE((data->>'totalEarnings')::numeric, 0) + v_net))
         WHERE id = (v_tx.details->>'character_id');
      END IF;

      INSERT INTO tc_transactions (user_id, type, amount, balance_after, released_after, metadata)
      VALUES (
        v_tx.user_id, 'withdraw', -v_tx.amount_tc,
        v_user.coins_balance,
        v_user.released_balance,
        jsonb_build_object('approved_by', p_admin_id, 'pending_tx_id', p_tx_id)
      );
    END IF;

    UPDATE tc_pending_transactions
       SET status = 'approved', admin_id = p_admin_id, updated_at = NOW()
     WHERE id = p_tx_id;

  ELSE
    -- REJECT
    IF v_tx.type = 'withdraw' THEN
      -- Devolve o dinheiro congelado
      UPDATE tc_users
         SET coins_balance    = coins_balance + v_tx.amount_tc,
             released_balance = released_balance + CASE WHEN v_tx.method <> 'CHARACTER' THEN v_tx.amount_tc ELSE 0 END,
             updated_at       = NOW()
       WHERE id = v_tx.user_id;
    END IF;

    UPDATE tc_pending_transactions
       SET status = 'rejected', admin_id = p_admin_id,
           admin_notes = p_reason, updated_at = NOW()
     WHERE id = p_tx_id;
  END IF;

  -- Notificação para o usuário
  INSERT INTO tc_notifications (user_id, type, message, metadata)
  VALUES (
    v_tx.user_id,
    CASE WHEN p_action = 'APPROVE' THEN 'deposit_approved' ELSE 'transaction_rejected' END,
    CASE WHEN p_action = 'APPROVE'
      THEN 'Sua transação de ' || v_tx.amount_tc || ' TC foi APROVADA.'
      ELSE 'Sua transação de ' || v_tx.amount_tc || ' TC foi REJEITADA. Motivo: ' || COALESCE(p_reason, 'Não informado')
    END,
    jsonb_build_object('tx_id', p_tx_id)
  );

  RETURN jsonb_build_object('ok', TRUE);
END;
$$;
