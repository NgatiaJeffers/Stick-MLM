/**
 * Domain Value Object: MenuState
 * Represents the current state of the menu navigation
 */
export class MenuState {
  constructor(
    public readonly activeItemId: string | null = null,
    public readonly hoveredItemId: string | null = null,
    public readonly isMainMenuVisible: boolean = true,
    public readonly isSecondaryMenuVisible: boolean = false,
    public readonly isTertiaryMenuVisible: boolean = false,
    public readonly isMobileMenuOpen: boolean = false,
    public readonly isSticky: boolean = false,
    public readonly activeLevel: number = 1
  ) {}

  /**
   * Create new state with active item
   */
  withActiveItem(itemId: string | null, level: number = 1): MenuState {
    return new MenuState(
      itemId,
      this.hoveredItemId,
      this.isMainMenuVisible,
      level >= 2,  // Show secondary if level 2 or 3
      level === 3, // Show tertiary only if level 3
      this.isMobileMenuOpen,
      this.isSticky,
      level
    );
  }

  /**
   * Create new state with hovered item
   */
  withHoveredItem(itemId: string | null): MenuState {
    return new MenuState(
      this.activeItemId,
      itemId,
      this.isMainMenuVisible,
      this.isSecondaryMenuVisible,
      this.isTertiaryMenuVisible,
      this.isMobileMenuOpen,
      this.isSticky,
      this.activeLevel
    );
  }

  /**
   * Create new state with mobile menu toggled
   */
  withMobileMenuToggled(): MenuState {
    return new MenuState(
      this.activeItemId,
      this.hoveredItemId,
      this.isMainMenuVisible,
      this.isSecondaryMenuVisible,
      this.isTertiaryMenuVisible,
      !this.isMobileMenuOpen,
      this.isSticky,
      this.activeLevel
    );
  }

  /**
   * Create new state with mobile menu explicitly closed
   */
  withMobileMenuClosed(): MenuState {
    return new MenuState(
      this.activeItemId,
      this.hoveredItemId,
      this.isMainMenuVisible,
      this.isSecondaryMenuVisible,
      this.isTertiaryMenuVisible,
      false,
      this.isSticky,
      this.activeLevel
    );
  }

  /**
   * Create new state with sticky state
   */
  withStickyState(isSticky: boolean): MenuState {
    return new MenuState(
      this.activeItemId,
      this.hoveredItemId,
      this.isMainMenuVisible,
      this.isSecondaryMenuVisible,
      this.isTertiaryMenuVisible,
      this.isMobileMenuOpen,
      isSticky,
      this.activeLevel
    );
  }

  /**
   * Create new state with all menus hidden
   */
  withAllMenusHidden(): MenuState {
    return new MenuState(
      this.activeItemId,
      null, // Clear hover state
      false,
      false,
      false,
      false, // Close mobile menu too
      this.isSticky,
      1 // Reset to level 1
    );
  }

  /**
   * Create new state showing specific menu level
   */
  withMenuLevel(level: number, visible: boolean = true): MenuState {
    return new MenuState(
      this.activeItemId,
      this.hoveredItemId,
      level >= 1 ? visible : this.isMainMenuVisible,
      level >= 2 ? visible : this.isSecondaryMenuVisible,
      level >= 3 ? visible : this.isTertiaryMenuVisible,
      this.isMobileMenuOpen,
      this.isSticky,
      visible ? Math.max(level, this.activeLevel) : this.activeLevel
    );
  }

  /**
   * Check if any menu is currently visible
   */
  hasVisibleMenus(): boolean {
    return this.isMainMenuVisible || this.isSecondaryMenuVisible || this.isTertiaryMenuVisible;
  }

  /**
   * Check if in hover interaction mode
   */
  isHoverMode(): boolean {
    return this.hoveredItemId !== null;
  }

  /**
   * Convert to persistence-friendly object
   */
  toSerializable(): object {
    return {
      activeItemId: this.activeItemId,
      activeLevel: this.activeLevel,
      isSticky: this.isSticky,
      // Don't persist UI-specific state like hover or mobile menu
    };
  }

  /**
   * Create MenuState from serialized data
   */
  static fromSerializable(data: any): MenuState {
    return new MenuState(
      data.activeItemId || null,
      null, // Don't restore hover state
      true, // Always show main menu on restore
      data.activeLevel >= 2,
      data.activeLevel >= 3,
      false, // Don't restore mobile menu state
      data.isSticky || false,
      data.activeLevel || 1
    );
  }

  /**
   * Create default menu state
   */
  static default(): MenuState {
    return new MenuState();
  }
}
