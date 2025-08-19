import { MenuStateRepository } from '@domain/Repositories/MenuStateRepository';
import { MenuState } from '@domain/ValueObjects/MenuState';

/**
 * Infrastructure: Browser Storage Menu State Repository
 * Implements menu state persistence using localStorage and sessionStorage
 */
export class BrowserMenuStateRepository implements MenuStateRepository {
  private readonly storageKey = 'sticky_mlm_menu_state';
  private readonly sessionKey = 'sticky_mlm_session_state';

  async saveState(state: MenuState): Promise<void> {
    try {
      const serializedState = JSON.stringify(state.toSerializable());
      localStorage.setItem(this.storageKey, serializedState);
    } catch (error) {
      console.warn('Failed to save menu state to localStorage:', error);
      // Fallback to session storage
      this.saveSessionState(state);
    }
  }

  async loadState(): Promise<MenuState | null> {
    try {
      const serializedState = localStorage.getItem(this.storageKey);
      
      if (!serializedState) {
        return null;
      }

      const data = JSON.parse(serializedState);
      return MenuState.fromSerializable(data);

    } catch (error) {
      console.warn('Failed to load menu state from localStorage:', error);
      
      // Clear corrupted data
      try {
        localStorage.removeItem(this.storageKey);
      } catch {
        // Ignore cleanup errors
      }
      
      return null;
    }
  }

  async clearState(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
      sessionStorage.removeItem(this.sessionKey);
    } catch (error) {
      console.warn('Failed to clear menu state:', error);
    }
  }

  async hasStoredState(): Promise<boolean> {
    try {
      return localStorage.getItem(this.storageKey) !== null;
    } catch (error) {
      console.warn('Failed to check stored state:', error);
      return false;
    }
  }

  saveSessionState(state: MenuState): void {
    try {
      const serializedState = JSON.stringify(state.toSerializable());
      sessionStorage.setItem(this.sessionKey, serializedState);
    } catch (error) {
      console.warn('Failed to save menu state to sessionStorage:', error);
    }
  }

  loadSessionState(): MenuState | null {
    try {
      const serializedState = sessionStorage.getItem(this.sessionKey);
      
      if (!serializedState) {
        return null;
      }

      const data = JSON.parse(serializedState);
      return MenuState.fromSerializable(data);

    } catch (error) {
      console.warn('Failed to load menu state from sessionStorage:', error);
      
      // Clear corrupted data
      try {
        sessionStorage.removeItem(this.sessionKey);
      } catch {
        // Ignore cleanup errors
      }
      
      return null;
    }
  }

  /**
   * Clear expired state data (older than 7 days)
   */
  async cleanupExpiredState(): Promise<void> {
    try {
      const state = await this.loadState();
      if (!state) return;

      // Check if we have timestamp data (would need to be added to MenuState)
      // For now, we can implement a simple cleanup based on localStorage entries
      
      // Get all localStorage keys
      const allKeys = Object.keys(localStorage);
      const menuKeys = allKeys.filter(key => key.startsWith('sticky_mlm_'));
      
      // Clean up old entries (this is a simplified approach)
      menuKeys.forEach(key => {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            // If the data doesn't have expected structure, remove it
            if (!data || typeof data !== 'object') {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      });

    } catch (error) {
      console.warn('Failed to cleanup expired state:', error);
    }
  }

  /**
   * Get storage usage statistics
   */
  getStorageInfo(): {
    hasLocalStorage: boolean;
    hasSessionStorage: boolean;
    localStorageUsed: number;
    sessionStorageUsed: number;
  } {
    const hasLocalStorage = this.isStorageAvailable('localStorage');
    const hasSessionStorage = this.isStorageAvailable('sessionStorage');
    
    let localStorageUsed = 0;
    let sessionStorageUsed = 0;
    
    if (hasLocalStorage) {
      try {
        const data = localStorage.getItem(this.storageKey);
        localStorageUsed = data ? data.length : 0;
      } catch {
        // Ignore errors
      }
    }
    
    if (hasSessionStorage) {
      try {
        const data = sessionStorage.getItem(this.sessionKey);
        sessionStorageUsed = data ? data.length : 0;
      } catch {
        // Ignore errors
      }
    }
    
    return {
      hasLocalStorage,
      hasSessionStorage,
      localStorageUsed,
      sessionStorageUsed
    };
  }

  /**
   * Check if a storage type is available
   */
  private isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
    try {
      const storage = window[type];
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}
