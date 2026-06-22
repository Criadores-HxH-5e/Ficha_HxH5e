import { NenType, TowerFloorData } from './types';

export const APP_VERSION = "2.1.0"; // Versão atual do Terminal

export const INITIAL_CHARACTER: any = {
  name: "Killua Z.",
  level: 5,
  floor: 1, // Top level for blueprint sync
  hunterStars: 1,
  nenType: NenType.TRANSMUTACAO,
  isFloorMaster: false,
  auraPoints: { current: 120, max: 150 },
  hitPoints: { current: 45, max: 45 },
  attributes: {
    strength: 14,
    dexterity: 18,
    constitution: 14,
    intelligence: 16,
    wisdom: 12,
    charisma: 13,
  },
  jenny: 0, // Saldo REAL começa zerado
  totalEarnings: 0,
  trainingJenny: 500, // Saldo de TREINO inicial
  investmentsPlaced: 0, // Contador inicia em 0
  investmentHistory: [],
  fighterStats: {
    currentFloor: 1, // Legacy sync
    totalWins: 0,
    totalLosses: 0,
    floorMasterWins: 0, 
    floorMasterLosses: 0, 
    hype: {
      totalInvestmentsCount: 0,
      totalJennyVolume: 0,
    },
    battleHistory: []
  }
};

export const NEN_COLORS = {
  [NenType.REFORCO]: '#00ff41',
  [NenType.TRANSMUTACAO]: '#a020f0',
  [NenType.EMISSAO]: '#ffff00',
  [NenType.CONJURACAO]: '#ff003c',
  [NenType.MANIPULACAO]: '#00f0ff',
  [NenType.ESPECIALIZACAO]: '#ffffff',
};

// Taxa de retenção da Torre (House Edge) sobre o total de investimentos (10%)
export const TOWER_TAX_RATE = 0.10;

// Economia Real
export const EXCHANGE_RATE = 100; // R$ 1 = 100 TC Coin
export const WITHDRAW_TAX_RATE = 0.30; // 30% de taxa no saque

// Regras de Carteira
export const MIN_WITHDRAW_J = 500; // Mínimo 500 TC Coin (R$ 5,00) para saque
export const INVESTMENTS_TO_UNLOCK_TRAINING = 5; // Investimentos necessários para converter saldo de treino

export const TOWER_FLOOR_DATA: TowerFloorData[] = [
  { minFloor: 1, maxFloor: 9, benefits: 'Nenhum', housingCost: null, housingLabel: 'Não Liberada', prizeMoney: 'Lanche ou Bebida', investMin: 50, investAvg: 100, investMax: 150 },
  { minFloor: 10, maxFloor: 19, benefits: 'Nenhum', housingCost: null, housingLabel: 'Não Liberada', prizeMoney: 50, investMin: 50, investAvg: 100, investMax: 150 },
  { minFloor: 20, maxFloor: 29, benefits: 'Nenhum', housingCost: null, housingLabel: 'Não Liberada', prizeMoney: 100, investMin: 50, investAvg: 100, investMax: 150 },
  { minFloor: 30, maxFloor: 39, benefits: 'Nenhum', housingCost: null, housingLabel: 'Não Liberada', prizeMoney: 200, investMin: 50, investAvg: 100, investMax: 150 },
  { minFloor: 40, maxFloor: 49, benefits: 'Nenhum', housingCost: null, housingLabel: 'Não Liberada', prizeMoney: 250, investMin: 50, investAvg: 100, investMax: 150 },
  { minFloor: 50, maxFloor: 59, benefits: 'Estadia na Torre', housingCost: 300, housingLabel: '300 $/dia', prizeMoney: 500, investMin: 150, investAvg: 225, investMax: 300 },
  { minFloor: 60, maxFloor: 69, benefits: 'Estadia na Torre', housingCost: 300, housingLabel: '300 $/dia', prizeMoney: 500, investMin: 150, investAvg: 225, investMax: 300 },
  { minFloor: 70, maxFloor: 79, benefits: 'Estadia na Torre', housingCost: 400, housingLabel: '400 $/dia', prizeMoney: 500, investMin: 150, investAvg: 225, investMax: 300 },
  { minFloor: 80, maxFloor: 89, benefits: 'Estadia na Torre', housingCost: 400, housingLabel: '400 $/dia', prizeMoney: 500, investMin: 150, investAvg: 225, investMax: 300 },
  { minFloor: 90, maxFloor: 99, benefits: 'Estadia na Torre', housingCost: 600, housingLabel: '600 $/dia', prizeMoney: 600, investMin: 150, investAvg: 225, investMax: 300 },
  { minFloor: 100, maxFloor: 109, benefits: 'Estadia na Torre', housingCost: 600, housingLabel: '600 $/dia', prizeMoney: 600, investMin: 300, investAvg: 525, investMax: 750 },
  { minFloor: 110, maxFloor: 119, benefits: 'Estadia na Torre', housingCost: 800, housingLabel: '800 $/dia', prizeMoney: 750, investMin: 300, investAvg: 525, investMax: 750 },
  { minFloor: 120, maxFloor: 129, benefits: 'Estadia na Torre', housingCost: 800, housingLabel: '800 $/dia', prizeMoney: 750, investMin: 300, investAvg: 525, investMax: 750 },
  { minFloor: 130, maxFloor: 139, benefits: 'Estadia na Torre', housingCost: 1000, housingLabel: '1000 $/dia', prizeMoney: 1000, investMin: 300, investAvg: 525, investMax: 750 },
  { minFloor: 140, maxFloor: 149, benefits: 'Estadia na Torre', housingCost: 1000, housingLabel: '1000 $/dia', prizeMoney: 1000, investMin: 300, investAvg: 525, investMax: 750 },
  { minFloor: 150, maxFloor: 159, benefits: 'Estadia na Torre', housingCost: 1000, housingLabel: '1000 $/dia', prizeMoney: 1250, investMin: 500, investAvg: 1250, investMax: 2000 },
  { minFloor: 160, maxFloor: 169, benefits: 'Estadia na Torre', housingCost: 800, housingLabel: '800 $/dia', prizeMoney: 1500, investMin: 500, investAvg: 1250, investMax: 2000 },
  { minFloor: 170, maxFloor: 179, benefits: 'Estadia na Torre', housingCost: 600, housingLabel: '600 $/dia', prizeMoney: 1750, investMin: 500, investAvg: 1250, investMax: 2000 },
  { minFloor: 180, maxFloor: 189, benefits: 'Estadia na Torre', housingCost: 400, housingLabel: '400 $/dia', prizeMoney: 2000, investMin: 1000, investAvg: 2000, investMax: 3000 },
  { minFloor: 190, maxFloor: 199, benefits: 'Estadia na Torre', housingCost: 300, housingLabel: '300 $/dia', prizeMoney: 2500, investMin: 1250, investAvg: 2250, investMax: 3500 },
  { minFloor: 200, maxFloor: 229, benefits: 'Estadia na Torre', housingCost: 0, housingLabel: 'Gratuito', prizeMoney: 0, investMin: 5000, investAvg: 7500, investMax: 10000 },
  { minFloor: 230, maxFloor: 250, benefits: 'Estadia na Torre', housingCost: 0, housingLabel: 'Gratuito', prizeMoney: 0, investMin: 15000, investAvg: 22500, investMax: 35000 },
];

/**
 * CONFIGURAÇÃO DO DISCORD E ADMINISTRAÇÃO
 */
export const DISCORD_CONFIG = {
  // Webhook para ENVIAR mensagens do App PARA o Discord (Log de Apostas)
  OUTBOUND_WEBHOOK_URL: "https://discord.com/api/webhooks/1493917277530230855/JeSYgcrwBYIJ1pqey92jDe2MKHeLGAGKkKC1VIs6xA3aQlAeiFHz8w3K19-QZSq_7p_f", 

  // Endereço para RECEBER notificações (Futuro)
  INBOUND_API_URL: "" 
};

/**
 * CONFIGURAÇÃO DE CARGOS DO DISCORD (RBAC)
 */
export const DISCORD_ROLES = {
  JUDGE: ["1100415887971991572", "1263215631784869949", "1335940980628521000"], // Arbitro/Narrador/Mestre, Candidato a Mestre, PLAYTESTER(S)
  INVESTOR: ["1100984179845505044"] // Investidor/Competidor da Torre Celestial
};

/**
 * LISTA DE JUÍZES (ADMINS POR ID)
 * Adicione aqui os IDs de USUÁRIO do Discord que terão permissão de "Juiz da Torre".
 * 
 * Cargos Autorizados (Referência):
 * - Arbitro/Narrador/Mestre: 1100415887971991572
 * - Candidato a Mestre: 1263215631784869949
 * - Playtester: 1335940980628521000
 */
export const ADMIN_USERS = [
    "513323323355037717", // Lucas Avila
    "1262779092646758404", // Outro Admin
    "521367784013922304", // ID adicional
    "741703273188229150"  // ID adicional
];

export const ADMIN_CONFIG = {
  ADMIN_IDS: ADMIN_USERS, 
  SERVER_ID: '831867588656758804' 
};
