import { useState, useCallback } from 'react';
import { MenuHierarchy } from '@domain/Entities/MenuHierarchy';
import { MenuItem } from '@domain/Entities/MenuItem';
import { MenuState } from '@domain/ValueObjects/MenuState';

/**
 * Custom hook for managing menu state and interactions
 */
export const useMenuState = (
  initialHierarchy?: MenuHierarchy,
  onStateChange?: (state: MenuState) => void
) => {
  const [hierarchy, setHierarchy] = useState<MenuHierarchy | null>(initialHierarchy || null);
  const [menuState, setMenuState] = useState<MenuState>(MenuState.default());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update menu state and notify parent component
   */
  const updateMenuState = useCallback((newState: MenuState) => {
    setMenuState(newState);
    if (onStateChange) {
      onStateChange(newState);
    }
  }, [onStateChange]);

  /**
   * Activate a menu item
   */
  const activateItem = useCallback((itemId: string) => {
    if (!hierarchy) return;

    const item = hierarchy.findItem(itemId);
    if (!item) return;

    const newState = menuState.withActiveItem(itemId, item.level);
    const updatedHierarchy = hierarchy.setActiveItem(itemId);
    
    setHierarchy(updatedHierarchy);
    updateMenuState(newState);
  }, [hierarchy, menuState, updateMenuState]);

  /**
   * Handle hover interactions
   */
  const hoverItem = useCallback((itemId: string | null) => {
    const newState = menuState.withHoveredItem(itemId);
    updateMenuState(newState);
  }, [menuState, updateMenuState]);

  /**
   * Toggle mobile menu
   */
  const toggleMobileMenu = useCallback(() => {
    const newState = menuState.withMobileMenuToggled();
    updateMenuState(newState);
  }, [menuState, updateMenuState]);

  /**
   * Set sticky state
   */
  const setStickyState = useCallback((isSticky: boolean) => {
    const newState = menuState.withStickyState(isSticky);
    updateMenuState(newState);
  }, [menuState, updateMenuState]);

  /**
   * Show/hide menu level
   */
  const setMenuLevel = useCallback((level: number, visible: boolean = true) => {
    const newState = menuState.withMenuLevel(level, visible);
    updateMenuState(newState);
  }, [menuState, updateMenuState]);

  /**
   * Reset menu state to default
   */
  const resetMenuState = useCallback(() => {
    const newState = MenuState.default();
    updateMenuState(newState);
  }, [updateMenuState]);

  /**
   * Load menu hierarchy
   */
  const loadHierarchy = useCallback(async (newHierarchy: MenuHierarchy) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setHierarchy(newHierarchy);
      
      // If there's a current page match, activate it
      const currentUrl = window.location.pathname;
      const matchingItem = newHierarchy.items.find(item => 
        item.url === currentUrl || 
        item.url === window.location.href ||
        (item.url.startsWith('/') && window.location.pathname.startsWith(item.url))
      );
      
      if (matchingItem) {
        activateItem(matchingItem.id);
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [activateItem]);

  /**
   * Get visible menu items based on current state
   */
  const getVisibleItems = useCallback(() => {
    if (!hierarchy) {
      return { main: [], secondary: [], tertiary: [] };
    }

    const targetItemId = menuState.hoveredItemId || menuState.activeItemId;
    const mainItems = hierarchy.getRootItems();
    
    if (!targetItemId) {
      return { main: mainItems, secondary: [], tertiary: [] };
    }

    const targetItem = hierarchy.findItem(targetItemId);
    if (!targetItem) {
      return { main: mainItems, secondary: [], tertiary: [] };
    }

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
      const level2Parent = hierarchy.findItem(targetItem.parentId!);
      if (level2Parent?.parentId) {
        result.secondary = hierarchy.getSecondaryItems(level2Parent.parentId);
        result.tertiary = hierarchy.getTertiaryItems(level2Parent.id);
      }
    }

    return result;
  }, [hierarchy, menuState]);

  /**
   * Check if item is in active trail
   */
  const isInActiveTrail = useCallback((itemId: string): boolean => {
    if (!hierarchy || !menuState.activeItemId) return false;
    
    if (itemId === menuState.activeItemId) return true;
    
    const activeTrail = hierarchy.getActiveTrail();
    return activeTrail.some(item => item.id === itemId);
  }, [hierarchy, menuState.activeItemId]);

  return {
    // State
    hierarchy,
    menuState,
    isLoading,
    error,
    
    // Actions
    activateItem,
    hoverItem,
    toggleMobileMenu,
    setStickyState,
    setMenuLevel,
    resetMenuState,
    updateMenuState,
    loadHierarchy,
    
    // Computed
    visibleItems: getVisibleItems(),
    isInActiveTrail,
    
    // Helpers
    hasHierarchy: hierarchy !== null,
    hasActiveItem: menuState.activeItemId !== null,
    isMobileMenuOpen: menuState.isMobileMenuOpen,
    isSticky: menuState.isSticky,
  };
};
