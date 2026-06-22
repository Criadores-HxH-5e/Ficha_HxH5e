/**
 * Stub Firebase — Firebase foi substituído por Supabase.
 * Este arquivo existe apenas para não quebrar imports legados do modo V1 Classic.
 * auth.currentUser = null sempre; onAuthStateChanged dispara imediatamente com null.
 */

export const auth = {
  currentUser: null as null,
  onAuthStateChanged: (cb: (user: null) => void) => {
    setTimeout(() => cb(null), 0);
    return () => {};
  },
};

export const db = null;
