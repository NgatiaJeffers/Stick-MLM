import { MenuStateRepository } from '@domain/Repositories/MenuStateRepository';
import { MenuState } from '@domain/ValueObjects/MenuState';
import { MenuHierarchy } from '@domain/Entities/MenuHierarchy';
import { MenuNavigationService } from '@domain/Services/MenuNavigationService';

/**
 * Application Use Case: ActivateMenuItem
 * Activates a menu item and updates navigation state
 */
export class ActivateMenuItem {
  constructor(
    private readonly menuStateRepository: MenuStateRepository,
    private readonly navigationService: MenuNavigationService
  ) {}

  async execute(
    menuHierarchy: MenuHierarchy,
    itemId: string,
    persistState: boolean = true
  ): Promise<ActivateMenuItemResult> {
    try {
      // Validate that the menu item exists
      const menuItem = menuHierarchy.findItem(itemId);
      if (!menuItem) {
        return {
          success: false,
          error: `Menu item not found: ${itemId}`,
          newState: MenuState.default()
        };
      }

      // Calculate the appropriate menu level and visibility
      const level = menuItem.level;
      const visibleMenus = this.navigationService.getVisibleMenuItems(
        menuHierarchy, 
        itemId
      );

      // Create new menu state
      const newState = MenuState.default()
        .withActiveItem(itemId, level)
        .withMenuLevel(1, true) // Always show main menu
        .withMenuLevel(2, visibleMenus.secondary.length > 0)
        .withMenuLevel(3, visibleMenus.tertiary.length > 0);

      // Persist state if requested
      if (persistState) {
        await this.menuStateRepository.saveState(newState);
      } else {
        // Save only for current session
        this.menuStateRepository.saveSessionState(newState);
      }

      // Update the hierarchy with active state
      const updatedHierarchy = menuHierarchy.setActiveItem(itemId);

      return {
        success: true,
        error: null,
        newState,
        updatedHierarchy,
        breadcrumbTrail: this.navigationService.calculateBreadcrumbTrail(menuHierarchy, itemId),
        visibleMenus
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error activating menu item',
        newState: MenuState.default()
      };
    }
  }
}

export interface ActivateMenuItemResult {
  success: boolean;
  error: string | null;
  newState: MenuState;
  updatedHierarchy?: MenuHierarchy;
  breadcrumbTrail?: import('@domain/Entities/MenuItem').MenuItem[];
  visibleMenus?: {
    main: import('@domain/Entities/MenuItem').MenuItem[];
    secondary: import('@domain/Entities/MenuItem').MenuItem[];
    tertiary: import('@domain/Entities/MenuItem').MenuItem[];
  };
}
