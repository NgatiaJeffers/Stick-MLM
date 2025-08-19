import React, { useEffect, useState } from 'react';
import { useMenuState } from '../hooks/useMenuState';
import { useWooCommerceCart } from '../hooks/useWooCommerceCart';
import { MenuHierarchy } from '@domain/Entities/MenuHierarchy';
import { MenuItem } from '@domain/Entities/MenuItem';
import { MenuNavigationService } from '@domain/Services/MenuNavigationService';
import { LoadMenuHierarchy } from '@application/UseCases/LoadMenuHierarchy';
import { ActivateMenuItem } from '@application/UseCases/ActivateMenuItem';
import { RestoreMenuState } from '@application/UseCases/RestoreMenuState';
import { WordPressMenuRepository } from '@infrastructure/WordPress/WordPressMenuRepository';
import { BrowserMenuStateRepository } from '@infrastructure/Persistence/BrowserMenuStateRepository';
import { MainMenuLevel } from './MainMenuLevel';
import { SecondaryMenuLevel } from './SecondaryMenuLevel';
import { TertiaryMenuLevel } from './TertiaryMenuLevel';
import { MobileMenuDrawer } from './MobileMenuDrawer';
import { CartWidget } from './CartWidget';
import clsx from 'clsx';

interface StickyMultiLayerMenuProps {
  apiUrl: string;
  nonce: string;
  initialMenuData?: any;
  currentUrl: string;
  isWooCommerceActive: boolean;
}

/**
 * Main Application Component: StickyMultiLayerMenu
 * Orchestrates the entire menu system with all layers and functionality
 */
export const StickyMultiLayerMenu: React.FC<StickyMultiLayerMenuProps> = ({
  apiUrl,
  nonce,
  initialMenuData,
  isWooCommerceActive: initialWooCommerceStatus,
}) => {
  // Dependencies injection
  const menuRepository = new WordPressMenuRepository(apiUrl, nonce);
  const menuStateRepository = new BrowserMenuStateRepository();
  const navigationService = new MenuNavigationService();
  
  // Use cases
  const loadMenuHierarchy = new LoadMenuHierarchy(menuRepository, navigationService);
  const activateMenuItem = new ActivateMenuItem(menuStateRepository, navigationService);
  const restoreMenuState = new RestoreMenuState(menuStateRepository);

  // Component state
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Custom hooks
  const { 
    hierarchy, 
    menuState, 
    hoverItem, 
    updateMenuState, 
    loadHierarchy,
    toggleMobileMenu,
    setStickyState,
    visibleItems,
    isInActiveTrail,
    isMobileMenuOpen
  } = useMenuState();
  const cartState = useWooCommerceCart();

  /**
   * Initialize the application
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Detect mobile device
        const checkMobile = () => {
          setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // 2. Load menu hierarchy
        let hierarchy: MenuHierarchy | null = null;
        
        if (initialMenuData) {
          // Transform initial WordPress data
          hierarchy = transformWordPressMenuData(initialMenuData);
        } else {
          // Load from API
          const result = await loadMenuHierarchy.execute();
          hierarchy = result.hierarchy;
        }
        
        if (hierarchy) {
          await loadHierarchy(hierarchy);
        }

        // 3. Restore menu state
        const restoreResult = await restoreMenuState.execute();
        if (restoreResult.success && restoreResult.state) {
          // Apply restored state if valid, but force mobile menu closed initially
          const safeState = restoreResult.state.withMobileMenuClosed();
          updateMenuState(safeState);
        }

        // 4. Initialize WooCommerce if active
        if (initialWooCommerceStatus) {
          await cartState.loadCart();
        }

        setIsInitialized(true);
        
        console.log('Sticky Multi-Layer Menu initialized successfully', {
          hierarchyLoaded: !!hierarchy,
          stateRestored: restoreResult.success,
          wooCommerceActive: initialWooCommerceStatus,
          isMobile,
          isMobileMenuOpen: false // Should always be false on init
        });

      } catch (error) {
        console.error('Failed to initialize Sticky Multi-Layer Menu:', error);
        setIsInitialized(true); // Still mark as initialized to show fallback
      }
    };

    initializeApp();
  }, [initialMenuData, initialWooCommerceStatus, loadMenuHierarchy, restoreMenuState, menuState, cartState]);

  /**
   * Handle scroll for sticky behavior
   */
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrollY(currentScrollY);
          
          // Determine sticky state (activate after scrolling 100px)
          const shouldBeSticky = currentScrollY > 100;
          if (shouldBeSticky !== isSticky) {
            setIsSticky(shouldBeSticky);
            setStickyState(shouldBeSticky);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isSticky, menuState]);

  /**
   * Handle menu item activation
   */
  const handleMenuItemClick = async (itemId: string) => {
    if (!hierarchy) return;
    
    try {
      const result = await activateMenuItem.execute(hierarchy, itemId, true);
      if (result.success && result.newState) {
        updateMenuState(result.newState);
        
        if (result.updatedHierarchy) {
          await loadHierarchy(result.updatedHierarchy);
        }
      }
    } catch (error) {
      console.error('Failed to activate menu item:', error);
    }
  };

  /**
   * Handle mobile menu toggle
   */
  const handleMobileMenuToggle = () => {
    toggleMobileMenu();
  };

  /**
   * Transform WordPress menu data to domain model
   */
  const transformWordPressMenuData = (data: any): MenuHierarchy => {
    const items: MenuItem[] = [];
    
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((wpItem: any) => {
        const menuItem = new MenuItem(
          wpItem.ID?.toString() || wpItem.id?.toString() || '',
          wpItem.title || wpItem.post_title || '',
          wpItem.url || wpItem.guid || '#',
          wpItem.menu_item_parent && wpItem.menu_item_parent !== '0' ? wpItem.menu_item_parent.toString() : null,
          parseInt(wpItem.level || '1', 10),
          parseInt(wpItem.menu_order || '0', 10),
          wpItem.classes || [],
          wpItem.target || '_self',
          wpItem.description || wpItem.post_excerpt || '',
          wpItem.current === true,
          []
        );
        items.push(menuItem);
      });
    }

    return new MenuHierarchy(
      data.id || 'main-menu',
      data.name || 'Main Menu',
      items,
      data.location || 'primary'
    );
  };

  // Container classes
  const containerClasses = clsx(
    'sticky-multilayer-menu',
    {
      'sticky-multilayer-menu--sticky': isSticky,
      'sticky-multilayer-menu--mobile-open': isMobileMenuOpen,
      'sticky-multilayer-menu--initialized': isInitialized,
      'sticky-multilayer-menu--has-woocommerce': cartState.isWooCommerceActive,
    }
  );

  // If not initialized, show loading state or fallback
  if (!isInitialized) {
    return (
      <div className="sticky-multilayer-menu sticky-multilayer-menu--loading">
        <div className="sticky-multilayer-menu__loader">
          <span>Loading menu...</span>
        </div>
      </div>
    );
  }

  return (
    <nav 
      className={containerClasses}
      role="navigation"
      aria-label="Main navigation"
      data-scroll-y={scrollY}
    >
      {/* Main menu container */}
      <div className="sticky-multilayer-menu__container">
        
        {/* Mobile menu toggle */}
        <button
          className="sticky-multilayer-menu__mobile-toggle"
          onClick={handleMobileMenuToggle}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu-drawer"
          aria-label="Toggle mobile menu"
        >
          <span className="sticky-multilayer-menu__hamburger">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Desktop menu levels */}
        <div className="sticky-multilayer-menu__levels">
          
          {/* Level 1: Main Menu */}
          {visibleItems.main.length > 0 && (
            <MainMenuLevel
              items={visibleItems.main}
              activeItemId={menuState.activeItemId}
              hoveredItemId={menuState.hoveredItemId}
              onItemClick={handleMenuItemClick}
              onItemHover={hoverItem}
              isInActiveTrail={isInActiveTrail}
            />
          )}

          {/* Level 2: Secondary Menu */}
          {visibleItems.secondary.length > 0 && menuState.isSecondaryMenuVisible && (
            <SecondaryMenuLevel
              items={visibleItems.secondary}
              activeItemId={menuState.activeItemId}
              hoveredItemId={menuState.hoveredItemId}
              onItemClick={handleMenuItemClick}
              onItemHover={hoverItem}
              isInActiveTrail={isInActiveTrail}
            />
          )}

          {/* Level 3: Tertiary Menu */}
          {visibleItems.tertiary.length > 0 && menuState.isTertiaryMenuVisible && (
            <TertiaryMenuLevel
              items={visibleItems.tertiary}
              activeItemId={menuState.activeItemId}
              hoveredItemId={menuState.hoveredItemId}
              onItemClick={handleMenuItemClick}
              onItemHover={hoverItem}
              isInActiveTrail={isInActiveTrail}
            />
          )}

        </div>

        {/* Cart Widget (WooCommerce) */}
        {cartState.isWooCommerceActive && (
          <CartWidget
            cart={cartState.cart}
            isLoading={cartState.isLoading}
            onCartUpdate={() => cartState.loadCart()}
          />
        )}

      </div>

      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        hierarchy={hierarchy}
        activeItemId={menuState.activeItemId}
        onItemClick={handleMenuItemClick}
        onClose={handleMobileMenuToggle}
        cart={cartState.isWooCommerceActive ? cartState.cart : undefined}
      />

      {/* Overlay for mobile menu */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="sticky-multilayer-menu__overlay"
          onClick={handleMobileMenuToggle}
          aria-hidden="true"
        />
      )}

    </nav>
  );
};
