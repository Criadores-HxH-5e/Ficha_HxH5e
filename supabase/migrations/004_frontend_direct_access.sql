-- ══════════════════════════════════════════════════════════
-- Migração 004: Acesso direto do frontend (sem backend Express)
--
-- Como o sistema é interno (grupo fechado de RPG), usamos
-- políticas permissivas para permitir que o frontend com
-- anon key faça INSERT/UPDATE/DELETE diretamente.
-- A integridade financeira é garantida pelas funções
-- PL/pgSQL com SECURITY DEFINER.
-- ══════════════════════════════════════════════════════════

-- ── tc_users ──────────────────────────────────────────────
CREATE POLICY "tc_users_insert_public"  ON tc_users FOR INSERT WITH CHECK (true);
CREATE POLICY "tc_users_update_public"  ON tc_users FOR UPDATE USING (true);

-- ── tc_fighters ───────────────────────────────────────────
CREATE POLICY "tc_fighters_insert_public" ON tc_fighters FOR INSERT WITH CHECK (true);
CREATE POLICY "tc_fighters_update_public" ON tc_fighters FOR UPDATE USING (true);
CREATE POLICY "tc_fighters_delete_public" ON tc_fighters FOR DELETE USING (true);

-- ── tc_quotes ─────────────────────────────────────────────
-- SELECT já tem política pública; adicionamos mutations
CREATE POLICY "tc_quotes_select_public"  ON tc_quotes  FOR SELECT  USING (true);
CREATE POLICY "tc_quotes_insert_public"  ON tc_quotes  FOR INSERT  WITH CHECK (true);
CREATE POLICY "tc_quotes_update_public"  ON tc_quotes  FOR UPDATE  USING (true);
CREATE POLICY "tc_quotes_delete_public"  ON tc_quotes  FOR DELETE  USING (true);

-- ── tc_transactions ───────────────────────────────────────
CREATE POLICY "tc_transactions_select_public" ON tc_transactions FOR SELECT USING (true);
CREATE POLICY "tc_transactions_insert_public" ON tc_transactions FOR INSERT WITH CHECK (true);

-- ── tc_pending_transactions ───────────────────────────────
CREATE POLICY "tc_pending_select_public" ON tc_pending_transactions FOR SELECT USING (true);
CREATE POLICY "tc_pending_insert_public" ON tc_pending_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "tc_pending_update_public" ON tc_pending_transactions FOR UPDATE USING (true);

-- ── tc_notifications ──────────────────────────────────────
CREATE POLICY "tc_notif_select_public" ON tc_notifications FOR SELECT USING (true);
CREATE POLICY "tc_notif_insert_public" ON tc_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "tc_notif_update_public" ON tc_notifications FOR UPDATE USING (true);

-- ── tc_npc_matches ────────────────────────────────────────
-- SELECT já tem política pública
CREATE POLICY "tc_npc_insert_public" ON tc_npc_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "tc_npc_update_public" ON tc_npc_matches FOR UPDATE USING (true);

-- ── tc_fights ─────────────────────────────────────────────
-- SELECT já tem política pública
CREATE POLICY "tc_fights_insert_public" ON tc_fights FOR INSERT WITH CHECK (true);

-- ── tc_backups ────────────────────────────────────────────
CREATE POLICY "tc_backups_select_public" ON tc_backups FOR SELECT USING (true);
CREATE POLICY "tc_backups_insert_public" ON tc_backups FOR INSERT WITH CHECK (true);
CREATE POLICY "tc_backups_update_public" ON tc_backups FOR UPDATE USING (true);

-- ── GRANT EXECUTE nas RPCs atômicas para a role anon ─────
-- As funções já têm SECURITY DEFINER nas migrations 001/002,
-- então rodam como postgres (bypassa RLS).
-- Aqui apenas garantimos que anon tem EXECUTE permission.
--
-- Assinaturas reais (ver migrations 001 e 002):
--   tc_buy_quote(TEXT, TEXT, INT, INT)
--   tc_sell_quote(TEXT, TEXT, INT, INT)
--   tc_record_fight(TEXT, TEXT, TEXT, TEXT, BOOLEAN)
--   tc_process_pending_tx(TEXT, TEXT, TEXT, TEXT)
GRANT EXECUTE ON FUNCTION tc_buy_quote(TEXT, TEXT, INT, INT)                     TO anon;
GRANT EXECUTE ON FUNCTION tc_sell_quote(TEXT, TEXT, INT, INT)                    TO anon;
GRANT EXECUTE ON FUNCTION tc_record_fight(TEXT, TEXT, TEXT, TEXT, BOOLEAN)       TO anon;
GRANT EXECUTE ON FUNCTION tc_process_pending_tx(TEXT, TEXT, TEXT, TEXT)          TO anon;
