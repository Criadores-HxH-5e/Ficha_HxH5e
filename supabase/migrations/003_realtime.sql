-- ══════════════════════════════════════════════════════════
-- Migração 003: Habilita Supabase Realtime nas tabelas
-- públicas para que o frontend receba atualizações
-- em tempo real sem precisar de polling.
-- ══════════════════════════════════════════════════════════

-- Tabelas públicas (leitura aberta, anon key funciona)
ALTER PUBLICATION supabase_realtime ADD TABLE tc_fighters;
ALTER PUBLICATION supabase_realtime ADD TABLE tc_quotes;
ALTER PUBLICATION supabase_realtime ADD TABLE tc_fights;
ALTER PUBLICATION supabase_realtime ADD TABLE tc_npc_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE tc_users;

-- ── API Endpoints para dados privados ──────────────────────
-- tc_transactions, tc_notifications e tc_pending_transactions
-- são lidos via API (service_role) para não expor dados
-- financeiros de outros usuários pelo anon key.
-- Nenhuma política SELECT extra necessária aqui.
