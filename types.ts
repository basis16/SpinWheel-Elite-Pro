
export interface Entry {
  id: string;
  text: string;
}

export interface WheelConfig {
  spinning: boolean;
  rotation: number;
  winner: string | null;
}

export enum Theme {
  PELANGI = 'PELANGI',
  PASTEL = 'PASTEL',
  NEON = 'NEON',
  SENJA = 'SENJA'
}
