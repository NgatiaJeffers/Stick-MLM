import { MenuItem } from './MenuItem';

/**
 * Domain Entity: MenuHierarchy
 * Represents the complete menu structure with hierarchical organization
 */
export class MenuHierarchy {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly items: MenuItem[],
    public readonly location: string = 'primary'
  ) {}

  /**
   * Get all root menu items (level 1)
   */
  getRootItems(): MenuItem[] {
    return this.items.filter(item => item.isRoot() && item.level === 1);
  }

  /**
   * Get all secondary items for a given parent
   */
  getSecondaryItems(parentId: string): MenuItem[] {
    return this.items.filter(item => 
      item.parentId === parentId && item.level === 2
    );
  }

  /**
   * Get all tertiary items for a given parent
   */
  getTertiaryItems(parentId: string): MenuItem[] {
    return this.items.filter(item => 
      item.parentId === parentId && item.level === 3
    );
  }

  /**
   * Find a menu item by ID
   */
  findItem(id: string): MenuItem | null {
    return this.items.find(item => item.id === id) || null;
  }

  /**
   * Get the active trail (breadcrumb path to active item)
   */
  getActiveTrail(): MenuItem[] {
    const activeItem = this.items.find(item => item.isActive);
    if (!activeItem) return [];

    const trail: MenuItem[] = [activeItem];
    let currentItem = activeItem;

    // Walk up the hierarchy
    while (currentItem.parentId) {
      const parentItem = this.findItem(currentItem.parentId);
      if (parentItem) {
        trail.unshift(parentItem);
        currentItem = parentItem;
      } else {
        break;
      }
    }

    return trail;
  }

  /**
   * Get all items at a specific level
   */
  getItemsByLevel(level: number): MenuItem[] {
    return this.items.filter(item => item.level === level);
  }

  /**
   * Build hierarchical tree structure from flat list
   */
  buildTree(): MenuItem[] {
    const itemMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];

    // First pass: create all items
    this.items.forEach(item => {
      itemMap.set(item.id, item);
    });

    // Second pass: organize hierarchy
    this.items.forEach(item => {
      if (item.isRoot()) {
        rootItems.push(this.buildItemWithChildren(item, itemMap));
      }
    });

    return rootItems.sort((a, b) => a.order - b.order);
  }

  /**
   * Helper to recursively build item with all its children
   */
  private buildItemWithChildren(item: MenuItem, itemMap: Map<string, MenuItem>): MenuItem {
    const children: MenuItem[] = [];
    
    this.items
      .filter(child => child.parentId === item.id)
      .forEach(child => {
        children.push(this.buildItemWithChildren(child, itemMap));
      });

    return new MenuItem(
      item.id,
      item.title,
      item.url,
      item.parentId,
      item.level,
      item.order,
      item.cssClasses,
      item.target,
      item.description,
      item.isActive,
      children.sort((a, b) => a.order - b.order)
    );
  }

  /**
   * Update active state for a menu item and deactivate others
   */
  setActiveItem(itemId: string): MenuHierarchy {
    const updatedItems = this.items.map(item => 
      item.withActiveState(item.id === itemId)
    );

    return new MenuHierarchy(
      this.id,
      this.name,
      updatedItems,
      this.location
    );
  }

  /**
   * Get the maximum depth of the menu hierarchy
   */
  getMaxDepth(): number {
    return Math.max(...this.items.map(item => item.level), 0);
  }

  /**
   * Validate the hierarchy structure
   */
  isValid(): boolean {
    // Check that all parent references exist
    for (const item of this.items) {
      if (item.parentId && !this.findItem(item.parentId)) {
        return false;
      }
    }

    // Check level consistency
    for (const item of this.items) {
      if (item.parentId) {
        const parent = this.findItem(item.parentId);
        if (parent && item.level !== parent.level + 1) {
          return false;
        }
      }
    }

    return true;
  }
}
