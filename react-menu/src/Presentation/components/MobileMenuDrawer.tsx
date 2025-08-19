import React, { useEffect, useRef } from 'react';
import { MenuHierarchy } from '@domain/Entities/MenuHierarchy';
import { MenuItem } from '@domain/Entities/MenuItem';
import { WooCommerceCart } from '@domain/ValueObjects/WooCommerceCart';
import clsx from 'clsx';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  hierarchy: MenuHierarchy | null;
  activeItemId: string | null;
  onItemClick: (itemId: string) => void;
  onClose: () => void;
  cart?: WooCommerceCart;
}

/**
 * Presentation Component: Mobile Menu Drawer
 * Renders the mobile off-canvas navigation drawer
 */
export const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
  isOpen,
  hierarchy,
  activeItemId,
  onItemClick,
  onClose,
  cart,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Handle escape key and focus management
  useEffect(() => {
    if (!isOpen) return;

    // Focus the first focusable element when opened
    if (firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Trap focus within drawer
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !drawerRef.current) return;

      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTabKey);

    // Prevent body scroll when drawer is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleItemClick = (itemId: string, url?: string) => {
    onItemClick(itemId);
    
    // Close drawer after item selection
    setTimeout(() => {
      onClose();
      
      // Navigate if it's a real URL
      if (url && url !== '#') {
        window.location.href = url;
      }
    }, 100);
  };

  const renderMenuItem = (item: MenuItem, level: number = 1): React.ReactNode => {
    const isActive = item.id === activeItemId;
    const hasChildren = item.hasChildren();
    
    const itemClasses = clsx(
      'sticky-multilayer-mobile-item',
      `sticky-multilayer-mobile-item--level-${level}`,
      {
        'sticky-multilayer-mobile-item--active': isActive,
        'sticky-multilayer-mobile-item--has-children': hasChildren,
      }
    );

    const linkClasses = clsx(
      'sticky-multilayer-mobile-link',
      `sticky-multilayer-mobile-link--level-${level}`,
      {
        'sticky-multilayer-mobile-link--active': isActive,
      }
    );

    return (
      <li key={item.id} className={itemClasses}>
        <button
          className={linkClasses}
          onClick={() => handleItemClick(item.id, item.url)}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className="sticky-multilayer-mobile-text">
            {item.title}
          </span>
          
          {hasChildren && (
            <span className="sticky-multilayer-mobile-indicator" aria-hidden="true">
              ▶
            </span>
          )}
        </button>
        
        {/* Render children if they exist */}
        {hasChildren && (
          <ul className="sticky-multilayer-mobile-submenu">
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  const drawerClasses = clsx(
    'sticky-multilayer-mobile-drawer',
    {
      'sticky-multilayer-mobile-drawer--open': isOpen,
    }
  );

  if (!hierarchy) {
    return null;
  }

  const rootItems = hierarchy.getRootItems();

  return (
    <div
      ref={drawerRef}
      id="mobile-menu-drawer"
      className={drawerClasses}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
      aria-hidden={!isOpen}
    >
      {/* Header */}
      <div className="sticky-multilayer-mobile-header">
        <h2 className="sticky-multilayer-mobile-title">
          Menu
        </h2>
        
        <button
          ref={firstFocusableRef}
          className="sticky-multilayer-mobile-close"
          onClick={onClose}
          aria-label="Close mobile menu"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="sticky-multilayer-mobile-nav">
        <ul 
          className="sticky-multilayer-mobile-menu"
          role="menu"
        >
          {rootItems.map(item => renderMenuItem(item))}
        </ul>
      </nav>

      {/* Cart section (if WooCommerce is active) */}
      {cart && (
        <div className="sticky-multilayer-mobile-cart">
          <button
            className="sticky-multilayer-mobile-cart-button"
            onClick={() => handleItemClick('cart', '/cart')}
          >
            <span className="sticky-multilayer-mobile-cart-icon" aria-hidden="true">
              🛒
            </span>
            <span className="sticky-multilayer-mobile-cart-text">
              Cart ({cart.itemCount})
            </span>
            <span className="sticky-multilayer-mobile-cart-total">
              {cart.getFormattedTotal()}
            </span>
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="sticky-multilayer-mobile-footer">
        <small className="sticky-multilayer-mobile-version">
          Sticky Multi-Layer Menu v1.0
        </small>
      </div>
    </div>
  );
};
