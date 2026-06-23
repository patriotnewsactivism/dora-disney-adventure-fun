import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

interface GameState {
  [key: string]: any;
}

const STORAGE_KEY_PREFIX = 'gameState_';

function getStorageKey(gameId: string): string {
  return `${STORAGE_KEY_PREFIX}${gameId}`;
}

export function saveGameState(gameId: string, state: GameState): boolean {
  try {
    const compressed = compressToUTF16(JSON.stringify(state));
    localStorage.setItem(getStorageKey(gameId), compressed);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('LocalStorage quota exceeded');
      return false;
    }
    console.error('Failed to save game state:', error);
    return false;
  }
}

export function loadGameState(gameId: string): GameState | null {
  try {
    const compressed = localStorage.getItem(getStorageKey(gameId));
    if (!compressed) return null;
    const decompressed = decompressFromUTF16(compressed);
    if (!decompressed) {
      console.warn('Corrupted game state data');
      return null;
    }
    return JSON.parse(decompressed);
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export function cleanupGameState(gameId: string): void {
  localStorage.removeItem(getStorageKey(gameId));
}