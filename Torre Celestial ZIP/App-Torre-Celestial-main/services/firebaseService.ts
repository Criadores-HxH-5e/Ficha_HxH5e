/**
 * Stub firebaseService — V1 Classic foi descontinuado.
 * Funções retornam no-ops para não quebrar o build.
 * V2 usa v2Service em src/services/v2Service.ts
 */
const noop = () => {};
const noopUnsub = () => () => {};

export const firebaseService = {
  subscribeToLiveMatch:   noopUnsub,
  subscribeToInvestments: noopUnsub,
  createMatch:            async () => {},
  updateMatch:            async () => {},
  clearMatch:             async () => {},
  placeInvestment:        async () => {},
  saveCharacter:          async () => {},
  saveProfile:            async () => {},
};
