import { MenuItem } from '../Entities/MenuItem';
import { MenuHierarchy } from '../Entities/MenuHierarchy';

/**
 * Domain Service: MenuNavigationService
 * Handles complex menu navigation logic and business rules
 */
export class MenuNavigationService {
  
  /**
   * Determine which menu items should be visible based on current active item
   */
  getVisibleMenuItems(
    hierarchy: MenuHierarchy, 
    activeItemId: string | null,
    hoveredItemId: string | null = null
  ): {
    main: MenuItem[];
    secondary: MenuItem[];
    tertiary: MenuItem[];
  } {
    const mainItems = hierarchy.getRootItems();
    
    // If no active or hovered item, show only main menu
    const targetItemId = hoveredItemId || activeItemId;
    if (!targetItemId) {
      return {
        main: mainItems,
        secondary: [],
        tertiary: []
      };
    }
    
    const targetItem = hierarchy.findItem(targetItemId);
    if (!targetItem) {
      return {
        main: mainItems,
        secondary: [],
        tertiary: []
      };
    }
    
    // Build the menu visibility based on the target item's level
    const result = {
      main: mainItems,
      secondary: [] as MenuItem[],
      tertiary: [] as MenuItem[]
    };
    
    if (targetItem.level === 1) {
      result.secondary = hierarchy.getSecondaryItems(targetItem.id);
    } else if (targetItem.level === 2) {
      result.secondary = hierarchy.getSecondaryItems(targetItem.parentId!);
      result.tertiary = hierarchy.getTertiaryItems(targetItem.id);
    } else if (targetItem.level === 3) {
      // Find the level 1 parent to show secondary menu
      const level2Parent = hierarchy.findItem(targetItem.parentId!);
      if (level2Parent?.parentId) {
        result.secondary = hierarchy.getSecondaryItems(level2Parent.parentId);
        result.tertiary = hierarchy.getTertiaryItems(level2Parent.id);
      }
    }
    
    return result;
  }
  
  /**
   * Calculate the breadcrumb trail for a given menu item
   */
  calculateBreadcrumbTrail(hierarchy: MenuHierarchy, itemId: string): MenuItem[] {
    const item = hierarchy.findItem(itemId);
    if (!item) return [];
    
    const trail: MenuItem[] = [item];
    let currentItem = item;
    
    // Walk up the hierarchy to build breadcrumb trail
    while (currentItem.parentId) {
      const parent = hierarchy.findItem(currentItem.parentId);
      if (parent) {
        trail.unshift(parent);
        currentItem = parent;
      } else {
        break;
      }
    }
    
    return trail;
  }
  
  /**
   * Find menu items by URL or partial URL match
   */
  findItemsByUrl(hierarchy: MenuHierarchy, url: string): MenuItem[] {
    const normalizedUrl = this.normalizeUrl(url);
    
    return hierarchy.items.filter(item => {
      const itemUrl = this.normalizeUrl(item.url);
      return itemUrl === normalizedUrl || itemUrl.includes(normalizedUrl);
    });
  }
  
  /**
   * Determine the active menu item based on current page URL
   */
  determineActiveItem(hierarchy: MenuHierarchy, currentUrl: string): MenuItem | null {
    const matches = this.findItemsByUrl(hierarchy, currentUrl);
    
    if (matches.length === 0) return null;
    
    // Prefer exact matches over partial matches
    const exactMatch = matches.find(item => 
      this.normalizeUrl(item.url) === this.normalizeUrl(currentUrl)
    );
    
    if (exactMatch) return exactMatch;
    
    // If no exact match, return the most specific match (longest URL)
    return matches.reduce((prev, current) => 
      current.url.length > prev.url.length ? current : prev
    );
  }
  
  /**
   * Check if a menu item should be highlighted as active or in active trail
   */
  isInActiveTrail(hierarchy: MenuHierarchy, itemId: string, activeItemId: string): boolean {
    if (itemId === activeItemId) return true;
    
    const trail = this.calculateBreadcrumbTrail(hierarchy, activeItemId);
    return trail.some(item => item.id === itemId);
  }
  
  /**
   * Get recommended menu items based on current context
   */
  getRecommendedItems(
    hierarchy: MenuHierarchy, 
    currentItemId: string,
    maxItems: number = 3
  ): MenuItem[] {
    const currentItem = hierarchy.findItem(currentItemId);
    if (!currentItem) return [];
    
    // Get siblings and children as recommendations
    const recommendations: MenuItem[] = [];
    
    // Add siblings (items with same parent)
    if (currentItem.parentId) {
      const siblings = hierarchy.items.filter(item => 
        item.parentId === currentItem.parentId && 
        item.id !== currentItem.id
      );
      recommendations.push(...siblings);
    } else {
      // For root items, add other root items
      const siblings = hierarchy.getRootItems().filter(item => 
        item.id !== currentItem.id
      );
      recommendations.push(...siblings);
    }
    
    // Add children if available
    if (currentItem.hasChildren()) {
      recommendations.push(...currentItem.children);
    }
    
    // Sort by order and limit results
    return recommendations
      .sort((a, b) => a.order - b.order)
      .slice(0, maxItems);
  }
  
  /**
   * Normalize URL for comparison (remove trailing slashes, query params, etc.)
   */
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);
      return urlObj.pathname.replace(/\/$/, '') || '/';
    } catch {
      // If URL parsing fails, just clean up the string
      return url.replace(/\/$/, '').split('?')[0].split('#')[0] || '/';
    }
  }
  
  /**
   * Validate menu accessibility compliance
   */
  validateAccessibility(hierarchy: MenuHierarchy): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check for items without proper labels
    hierarchy.items.forEach(item => {
      if (!item.title.trim()) {
        issues.push(`Menu item ${item.id} has empty title`);
      }
      
      if (item.url === '#' && !item.hasChildren()) {
        issues.push(`Menu item "${item.title}" has placeholder URL but no children`);
      }
    });
    
    // Check for excessive nesting
    if (hierarchy.getMaxDepth() > 3) {
      issues.push('Menu hierarchy exceeds maximum recommended depth of 3 levels');
    }
    
    // Check for orphaned items
    hierarchy.items.forEach(item => {
      if (item.parentId && !hierarchy.findItem(item.parentId)) {
        issues.push(`Menu item "${item.title}" references non-existent parent`);
      }
    });
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
