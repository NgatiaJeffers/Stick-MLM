import { MenuRepository } from '@domain/Repositories/MenuRepository';
import { MenuHierarchy } from '@domain/Entities/MenuHierarchy';
import { MenuItem } from '@domain/Entities/MenuItem';

/**
 * Infrastructure: WordPress REST API Menu Repository
 * Implements menu data access through WordPress REST API
 */
export class WordPressMenuRepository implements MenuRepository {
  private readonly apiBaseUrl: string;
  private readonly nonce: string;
  private menuCache: Map<string, { menu: MenuHierarchy; timestamp: number }> = new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(apiBaseUrl: string, nonce: string) {
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    this.nonce = nonce;
  }

  async loadMenuHierarchy(location: string = 'primary'): Promise<MenuHierarchy> {
    // Check cache first
    const cached = this.getCachedMenu(location);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/sticky-mlm/v1/menu/${location}`, {
        headers: {
          'X-WP-Nonce': this.nonce,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load menu: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const hierarchy = this.transformWordPressMenuData(data);
      
      // Cache the result
      await this.cacheMenu(hierarchy);
      
      return hierarchy;

    } catch (error) {
      console.error('Error loading menu hierarchy:', error);
      throw new Error(`Failed to load menu hierarchy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMenuLocations(): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/sticky-mlm/v1/menu-locations`, {
        headers: {
          'X-WP-Nonce': this.nonce,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get menu locations: ${response.status}`);
      }

      const data = await response.json();
      return data.locations || [];

    } catch (error) {
      console.error('Error getting menu locations:', error);
      return ['primary']; // Fallback to default location
    }
  }

  async menuExists(location: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/sticky-mlm/v1/menu/${location}/exists`, {
        headers: {
          'X-WP-Nonce': this.nonce,
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.exists === true;

    } catch (error) {
      console.error('Error checking menu existence:', error);
      return false;
    }
  }

  async getMenuById(menuId: string): Promise<MenuHierarchy | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/sticky-mlm/v1/menu-by-id/${menuId}`, {
        headers: {
          'X-WP-Nonce': this.nonce,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return this.transformWordPressMenuData(data);

    } catch (error) {
      console.error('Error getting menu by ID:', error);
      return null;
    }
  }

  async cacheMenu(menu: MenuHierarchy): Promise<void> {
    this.menuCache.set(menu.location, {
      menu,
      timestamp: Date.now()
    });
  }

  async invalidateCache(location?: string): Promise<void> {
    if (location) {
      this.menuCache.delete(location);
    } else {
      this.menuCache.clear();
    }
  }

  private getCachedMenu(location: string): MenuHierarchy | null {
    const cached = this.menuCache.get(location);
    
    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.menuCache.delete(location);
      return null;
    }

    return cached.menu;
  }

  /**
   * Transform WordPress menu data to domain entities
   */
  private transformWordPressMenuData(data: any): MenuHierarchy {
    const menuItems: MenuItem[] = [];

    if (data.items && Array.isArray(data.items)) {
      // Transform each menu item
      data.items.forEach((wpItem: any) => {
        const menuItem = this.transformWordPressMenuItem(wpItem);
        menuItems.push(menuItem);
      });
    }

    return new MenuHierarchy(
      data.id || 'unknown',
      data.name || 'Menu',
      menuItems,
      data.location || 'primary'
    );
  }

  /**
   * Transform individual WordPress menu item
   */
  private transformWordPressMenuItem(wpItem: any): MenuItem {
    return new MenuItem(
      wpItem.ID?.toString() || wpItem.id?.toString() || '',
      wpItem.title || wpItem.post_title || '',
      wpItem.url || wpItem.guid || '#',
      wpItem.menu_item_parent && wpItem.menu_item_parent !== '0' ? wpItem.menu_item_parent.toString() : null,
      this.calculateMenuLevel(wpItem),
      parseInt(wpItem.menu_order || '0', 10),
      this.parseMenuItemClasses(wpItem.classes),
      wpItem.target || '_self',
      wpItem.description || wpItem.post_excerpt || '',
      wpItem.current === true || wpItem.current_item_ancestor === true,
      [] // Children will be populated by MenuHierarchy.buildTree()
    );
  }

  /**
   * Calculate menu level based on WordPress menu structure
   */
  private calculateMenuLevel(wpItem: any): number {
    // WordPress doesn't directly provide level, so we calculate it
    // This is a simplified approach - the actual level calculation
    // should be done when building the hierarchy
    if (!wpItem.menu_item_parent || wpItem.menu_item_parent === '0') {
      return 1;
    }
    // For now, assume level 2 for items with parents
    // Real implementation would need to walk up the hierarchy
    return 2;
  }

  /**
   * Parse WordPress menu item CSS classes
   */
  private parseMenuItemClasses(classes: string | string[]): string[] {
    if (Array.isArray(classes)) {
      return classes.filter(cls => cls && cls.trim().length > 0);
    }
    
    if (typeof classes === 'string') {
      return classes.split(' ').filter(cls => cls && cls.trim().length > 0);
    }
    
    return [];
  }
}
