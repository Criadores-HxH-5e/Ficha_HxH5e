import { createClient } from '@supabase/supabase-js';

// Mesmas credenciais do HxH5e — mesmo projeto Supabase
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://qbppvrsevwucrbrtdonx.supabase.co';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFicHB2cnNldnd1Y3JicnRkb254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjA3OTgsImV4cCI6MjA5MTI5Njc5OH0.HCLqFi7jTrRpNZymWjGs-O2L3uPjWHGzD2Z2k2Dce-M';

// Cliente padrão com anon key — usado para leituras públicas e Realtime
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Session ────────────────────────────────────────────────────────

const SESSION_KEY = 'hxh_hunter_session';
const TOKEN_KEY   = 'hxh_tc_token';

export interface SessionUser {
  id: string;            // Discord ID (sem prefixo)
  username: string;
  discriminator?: string;
  avatar: string | null;
  roles?: string[];
  email?: string;
}

export const saveSession = (user: SessionUser, token: string) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_KEY, token);
};

export const loadSession = (): SessionUser | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const normalizeUserId = (id: string) =>
  id.startsWith('discord:') ? id : `discord:${id}`;
