import { Tile, GameState, Direction } from '../types/game';

const GRID_SIZE = 4;

export const createEmptyGrid = (): (Tile | null)[][] => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random()}`;
};

export const getEmptyCells = (grid: (Tile | null)[][]): { row: number; col: number }[] => {
  const empty: { row: number; col: number }[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (!grid[row][col]) {
        empty.push({ row, col });
      }
    }
  }
  return empty;
};

export const addRandomTile = (grid: (Tile | null)[][]): Tile | null => {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) return null;

  const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const tile: Tile = {
    id: generateId(),
    value,
    position: { row, col },
    isNew: true,
  };

  grid[row][col] = tile;
  return tile;
};

export const initializeGame = (): GameState => {
  const grid = createEmptyGrid();
  const tiles: Tile[] = [];

  // Add two initial tiles
  const tile1 = addRandomTile(grid);
  const tile2 = addRandomTile(grid);
  
  if (tile1) tiles.push(tile1);
  if (tile2) tiles.push(tile2);

  const savedBest = localStorage.getItem('2048-best-score');
  const bestScore = savedBest ? parseInt(savedBest) : 0;

  return {
    grid,
    score: 0,
    bestScore,
    gameStatus: 'playing',
    tiles,
  };
};

const rotateGrid = (grid: (Tile | null)[][]): (Tile | null)[][] => {
  const newGrid = createEmptyGrid();
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      newGrid[col][GRID_SIZE - 1 - row] = grid[row][col];
      if (newGrid[col][GRID_SIZE - 1 - row]) {
        newGrid[col][GRID_SIZE - 1 - row]!.position = { row: col, col: GRID_SIZE - 1 - row };
      }
    }
  }
  return newGrid;
};

const moveLeft = (grid: (Tile | null)[][]): { grid: (Tile | null)[][]; score: number; moved: boolean } => {
  let score = 0;
  let moved = false;
  const newGrid = createEmptyGrid();

  for (let row = 0; row < GRID_SIZE; row++) {
    const tiles = grid[row].filter(tile => tile !== null) as Tile[];
    let col = 0;

    for (let i = 0; i < tiles.length; i++) {
      const currentTile = tiles[i];
      
      if (i < tiles.length - 1 && currentTile.value === tiles[i + 1].value) {
        // Merge tiles
        const mergedTile: Tile = {
          id: generateId(),
          value: currentTile.value * 2,
          position: { row, col },
          mergedFrom: [currentTile.id, tiles[i + 1].id],
        };
        newGrid[row][col] = mergedTile;
        score += mergedTile.value;
        moved = true;
        i++; // Skip next tile
      } else {
        // Move tile
        const movedTile: Tile = {
          ...currentTile,
          position: { row, col },
        };
        newGrid[row][col] = movedTile;
        
        if (currentTile.position.col !== col) {
          moved = true;
        }
      }
      col++;
    }
  }

  return { grid: newGrid, score, moved };
};

export const move = (state: GameState, direction: Direction): GameState => {
  if (state.gameStatus !== 'playing') return state;

  let grid = state.grid.map(row => [...row]);
  let rotations = 0;

  // Rotate grid to make all moves equivalent to left
  switch (direction) {
    case 'right':
      rotations = 2;
      break;
    case 'up':
      rotations = 1;
      break;
    case 'down':
      rotations = 3;
      break;
  }

  for (let i = 0; i < rotations; i++) {
    grid = rotateGrid(grid);
  }

  const { grid: movedGrid, score: earnedScore, moved } = moveLeft(grid);

  // Rotate back
  let finalGrid = movedGrid;
  for (let i = 0; i < (4 - rotations) % 4; i++) {
    finalGrid = rotateGrid(finalGrid);
  }

  if (!moved) return state;

  // Add new tile
  const newTile = addRandomTile(finalGrid);
  
  // Collect all tiles
  const tiles: Tile[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (finalGrid[row][col]) {
        tiles.push(finalGrid[row][col]!);
      }
    }
  }

  const newScore = state.score + earnedScore;
  const newBestScore = Math.max(state.bestScore, newScore);
  
  if (newBestScore > state.bestScore) {
    localStorage.setItem('2048-best-score', newBestScore.toString());
  }

  // Check win condition
  const hasWon = tiles.some(tile => tile.value === 2048);
  const gameStatus = hasWon ? 'won' : checkGameOver(finalGrid) ? 'lost' : 'playing';

  return {
    grid: finalGrid,
    score: newScore,
    bestScore: newBestScore,
    gameStatus,
    tiles,
  };
};

const checkGameOver = (grid: (Tile | null)[][]): boolean => {
  // Check if there are empty cells
  if (getEmptyCells(grid).length > 0) return false;

  // Check if any adjacent tiles can merge
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const current = grid[row][col];
      if (!current) continue;

      // Check right
      if (col < GRID_SIZE - 1 && grid[row][col + 1]?.value === current.value) {
        return false;
      }
      // Check down
      if (row < GRID_SIZE - 1 && grid[row + 1][col]?.value === current.value) {
        return false;
      }
    }
  }

  return true;
};

// Função para reviver o jogo após assistir anúncio
export const reviveGame = (state: GameState): GameState => {
  if (state.gameStatus !== 'lost') return state;

  const grid = state.grid.map(row => [...row]);
  
  // Estratégia: remover algumas peças de menor valor para dar espaço
  const lowValueTiles: { row: number; col: number; value: number }[] = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const tile = grid[row][col];
      if (tile && tile.value <= 8) {
        lowValueTiles.push({ row, col, value: tile.value });
      }
    }
  }

  // Ordenar por valor (menores primeiro)
  lowValueTiles.sort((a, b) => a.value - b.value);

  // Remover até 3 peças de menor valor para criar espaço
  const tilesToRemove = Math.min(3, lowValueTiles.length);
  for (let i = 0; i < tilesToRemove; i++) {
    const { row, col } = lowValueTiles[i];
    grid[row][col] = null;
  }

  // Coletar tiles restantes
  const tiles: Tile[] = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col]) {
        tiles.push(grid[row][col]!);
      }
    }
  }

  return {
    ...state,
    grid,
    tiles,
    gameStatus: 'playing',
  };
};
