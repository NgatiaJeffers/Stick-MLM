import { MenuHierarchy } from '../Entities/MenuHierarchy';

/**
 * Domain Repository Interface: MenuRepository
 * Defines operations for menu data persistence and retrieval
 */
export interface MenuRepository {
  /**
   * Load menu hierarchy from WordPress
   */
  loadMenuHierarchy(location?: string): Promise<MenuHierarchy>;
  
  /**
   * Get available menu locations
   */
  getMenuLocations(): Promise<string[]>;
  
  /**
   * Check if a menu exists at the given location
   */
  menuExists(location: string): Promise<boolean>;
  
  /**
   * Get menu by ID
   */
  getMenuById(menuId: string): Promise<MenuHierarchy | null>;
  
  /**
   * Cache menu data for performance
   */
  cacheMenu(menu: MenuHierarchy): Promise<void>;
  
  /**
   * Invalidate menu cache
   */
  invalidateCache(location?: string): Promise<void>;
}
