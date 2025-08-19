/**
 * Domain Entity: MenuItem
 * Represents a single menu item with hierarchical relationships
 */
export class MenuItem {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly url: string,
    public readonly parentId: string | null = null,
    public readonly level: number = 1,
    public readonly order: number = 0,
    public readonly cssClasses: string[] = [],
    public readonly target: string = '_self',
    public readonly description: string = '',
    public readonly isActive: boolean = false,
    public readonly children: MenuItem[] = []
  ) {
    if (level < 1 || level > 3) {
      throw new Error('MenuItem level must be between 1 and 3');
    }
  }

  /**
   * Check if this menu item is a parent (has children)
   */
  hasChildren(): boolean {
    return this.children.length > 0;
  }

  /**
   * Check if this menu item is a root item (no parent)
   */
  isRoot(): boolean {
    return this.parentId === null;
  }

  /**
   * Get all descendant menu items (recursive)
   */
  getAllDescendants(): MenuItem[] {
    const descendants: MenuItem[] = [];
    
    for (const child of this.children) {
      descendants.push(child);
      descendants.push(...child.getAllDescendants());
    }
    
    return descendants;
  }

  /**
   * Find a child by ID
   */
  findChild(id: string): MenuItem | null {
    return this.children.find(child => child.id === id) || null;
  }

  /**
   * Check if this menu item can have children based on level
   */
  canHaveChildren(): boolean {
    return this.level < 3; // Max 3 levels
  }

  /**
   * Create a new MenuItem with updated active state
   */
  withActiveState(isActive: boolean): MenuItem {
    return new MenuItem(
      this.id,
      this.title,
      this.url,
      this.parentId,
      this.level,
      this.order,
      this.cssClasses,
      this.target,
      this.description,
      isActive,
      this.children.map(child => child.withActiveState(false)) // Deactivate children when parent changes
    );
  }

  /**
   * Add a child menu item
   */
  addChild(child: MenuItem): MenuItem {
    if (!this.canHaveChildren()) {
      throw new Error(`MenuItem at level ${this.level} cannot have children`);
    }

    if (child.level !== this.level + 1) {
      throw new Error(`Child menu item level must be ${this.level + 1}`);
    }

    const newChildren = [...this.children, child].sort((a, b) => a.order - b.order);
    
    return new MenuItem(
      this.id,
      this.title,
      this.url,
      this.parentId,
      this.level,
      this.order,
      this.cssClasses,
      this.target,
      this.description,
      this.isActive,
      newChildren
    );
  }
}
