import { MenuState } from '../ValueObjects/MenuState';

/**
 * Domain Repository Interface: MenuStateRepository  
 * Defines operations for menu state persistence and retrieval
 */
export interface MenuStateRepository {
  /**
   * Save menu state to persistent storage
   */
  saveState(state: MenuState): Promise<void>;
  
  /**
   * Load menu state from persistent storage
   */
  loadState(): Promise<MenuState | null>;
  
  /**
   * Clear stored menu state
   */
  clearState(): Promise<void>;
  
  /**
   * Check if state exists in storage
   */
  hasStoredState(): Promise<boolean>;
  
  /**
   * Save state for the current session only
   */
  saveSessionState(state: MenuState): void;
  
  /**
   * Load state for the current session
   */
  loadSessionState(): MenuState | null;
}
