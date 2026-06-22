
export enum NenType {
  REFORCO = 'Reforço',
  TRANSMUTACAO = 'Transmutação',
  EMISSAO = 'Emissão',
  CONJURACAO = 'Conjuração',
  MANIPULACAO = 'Manipulação',
  ESPECIALIZACAO = 'Especialização',
}

export interface CharacterAttributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface InvestmentRecord {
  id: string;
  matchId?: string;
  fighterId?: string;
  fighterName: string;
  amount: number;
  odds?: number;
  result: 'WIN' | 'LOSS' | 'PENDING';
  timestamp: string;
}

export interface BattleRecord {
  id: string;
  opponentName: string;
  result: 'WIN' | 'LOSS';
  floor: number;
}

export interface FighterStats {
  currentFloor: number;
  totalWins: number;
  totalLosses: number;
  floorMasterWins: number; // 0-10
  floorMasterLosses: number; // 0-4
  hype: {
    totalInvestmentsCount: number;
    totalJennyVolume: number;
  };
  battleHistory: BattleRecord[];
}

export interface Character {
  id: string; // Document ID
  ownerId: string; // Firebase UID
  name: string;
  discordId?: string;
  firebaseUid?: string; // Legacy/Compat
  level: number;
  hunterStars: number;
  nenType: NenType;
  isFloorMaster?: boolean;
  auraPoints: {
    current: number;
    max: number;
  };
  hitPoints: {
    current: number;
    max: number;
  };
  attributes: CharacterAttributes;
  
  // Wallet System
  jenny: number; // Saldo REAL (Sacável/Depositado/Lucro)
  trainingJenny: number; // Saldo de TREINO (Bloqueado)
  investmentsPlaced: number; // Contador para desbloqueio

  investmentHistory: InvestmentRecord[];
  fighterStats: FighterStats;
  floor: number;
  totalEarnings: number;
  imageUrl?: string;
  createdAt?: any;
  role?: 'admin' | 'user';
}

export interface UserProfile {
  userId: string;
  activeCharacterId?: string;
  discordId?: string;
  roles?: string[];
  lastLogin?: any;
}

export interface Competitor {
  id: string;
  name: string;
  imageUrl: string; 
  totalPool: number; 
}

export interface LiveMatch {
  id: string;
  floor: number;
  fighterA: Competitor;
  fighterB: Competitor;
  status: 'OPEN' | 'LOCKED' | 'FINISHED';
  winnerId?: string;
}

export interface DiscordWebhookConfig {
  url: string;
  username: string;
  enabled: boolean;
}

export interface InvestmentScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Insane';
  winMultiplier: number;
  status: 'pending' | 'resolved';
}

export interface ArenaEvent {
  type: 'MATCH_START' | 'MATCH_END' | 'ODDS_UPDATE';
  message: string;
  payload?: any;
}

export interface TowerFloorData {
  minFloor: number;
  maxFloor: number;
  benefits: string;
  housingCost: number | null; // null represents "Não Liberada" or Free (0)
  housingLabel: string; // To display "Não Liberada", "300 $/dia", "0"
  prizeMoney: string | number; // String for "Lanche", number for values
  investMin: number;
  investAvg: number;
  investMax: number;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  firebaseUid?: string;
  roles?: string[];
}
