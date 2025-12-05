export interface Tile {
  id: string;
  value: number;
  position: { row: number; col: number };
  isNew?: boolean;
  mergedFrom?: string[];
}

export interface GameState {
  grid: (Tile | null)[][];
  score: number;
  bestScore: number;
  gameStatus: 'playing' | 'won' | 'lost';
  tiles: Tile[];
}

export type Direction = 'up' | 'down' | 'left' | 'right';
