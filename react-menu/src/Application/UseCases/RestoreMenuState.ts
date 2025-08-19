import { MenuStateRepository } from '@domain/Repositories/MenuStateRepository';
import { MenuState } from '@domain/ValueObjects/MenuState';

/**
 * Application Use Case: RestoreMenuState
 * Restores menu state from persistent storage
 */
export class RestoreMenuState {
  constructor(
    private readonly menuStateRepository: MenuStateRepository
  ) {}

  async execute(fallbackToSession: boolean = true): Promise<RestoreMenuStateResult> {
    try {
      // Try to load from persistent storage first
      let restoredState = await this.menuStateRepository.loadState();
      let source: 'persistent' | 'session' | 'default' = 'persistent';

      // Fallback to session storage if persistent storage is empty
      if (!restoredState && fallbackToSession) {
        restoredState = this.menuStateRepository.loadSessionState();
        source = 'session';
      }

      // Fallback to default state if no stored state exists
      if (!restoredState) {
        restoredState = MenuState.default();
        source = 'default';
      }

      return {
        success: true,
        error: null,
        state: restoredState,
        source
      };

    } catch (error) {
      // If restoration fails, return default state
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error restoring menu state',
        state: MenuState.default(),
        source: 'default'
      };
    }
  }
}

export interface RestoreMenuStateResult {
  success: boolean;
  error: string | null;
  state: MenuState;
  source: 'persistent' | 'session' | 'default';
}
