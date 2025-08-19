import { MenuRepository } from '@domain/Repositories/MenuRepository';
import { MenuHierarchy } from '@domain/Entities/MenuHierarchy';
import { MenuNavigationService } from '@domain/Services/MenuNavigationService';

/**
 * Application Use Case: LoadMenuHierarchy
 * Loads and validates menu hierarchy from WordPress
 */
export class LoadMenuHierarchy {
  constructor(
    private readonly menuRepository: MenuRepository,
    private readonly navigationService: MenuNavigationService
  ) {}

  async execute(location: string = 'primary'): Promise<LoadMenuHierarchyResult> {
    try {
      // Check if menu exists at location
      const menuExists = await this.menuRepository.menuExists(location);
      if (!menuExists) {
        return {
          success: false,
          error: `No menu found at location: ${location}`,
          hierarchy: null
        };
      }

      // Load menu hierarchy
      const hierarchy = await this.menuRepository.loadMenuHierarchy(location);
      
      // Validate hierarchy structure
      if (!hierarchy.isValid()) {
        return {
          success: false,
          error: 'Menu hierarchy contains invalid structure',
          hierarchy: null
        };
      }

      // Validate accessibility compliance
      const accessibilityCheck = this.navigationService.validateAccessibility(hierarchy);
      if (!accessibilityCheck.isValid) {
        console.warn('Menu accessibility issues:', accessibilityCheck.issues);
        // Don't fail completely, but log warnings
      }

      // Cache the loaded menu for performance
      await this.menuRepository.cacheMenu(hierarchy);

      return {
        success: true,
        error: null,
        hierarchy,
        warnings: accessibilityCheck.issues
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error loading menu',
        hierarchy: null
      };
    }
  }
}

export interface LoadMenuHierarchyResult {
  success: boolean;
  error: string | null;
  hierarchy: MenuHierarchy | null;
  warnings?: string[];
}
