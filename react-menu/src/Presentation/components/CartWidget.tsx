import React from 'react';
import { WooCommerceCart } from '@domain/ValueObjects/WooCommerceCart';
import clsx from 'clsx';

interface CartWidgetProps {
  cart: WooCommerceCart;
  isLoading: boolean;
  onCartUpdate: () => void;
}

/**
 * Presentation Component: Cart Widget
 * Displays WooCommerce cart information in the menu
 */
export const CartWidget: React.FC<CartWidgetProps> = ({
  cart,
  isLoading,
  onCartUpdate,
}) => {
  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Navigate to cart page
    const cartUrl = '/cart'; // This should come from WordPress settings
    window.location.href = cartUrl;
  };

  const handleRefreshCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCartUpdate();
  };

  const widgetClasses = clsx(
    'sticky-multilayer-menu__cart',
    'sticky-multilayer-cart-widget',
    {
      'sticky-multilayer-cart-widget--loading': isLoading,
      'sticky-multilayer-cart-widget--empty': cart.isEmpty(),
      'sticky-multilayer-cart-widget--has-items': cart.hasItems(),
    }
  );

  const badgeClasses = clsx(
    'sticky-multilayer-cart-badge',
    {
      'sticky-multilayer-cart-badge--visible': cart.hasItems(),
    }
  );

  return (
    <div className={widgetClasses}>
      <button
        className="sticky-multilayer-cart-button"
        onClick={handleCartClick}
        aria-label={`Shopping cart with ${cart.itemCount} items`}
        disabled={isLoading}
      >
        {/* Cart icon */}
        <span className="sticky-multilayer-cart-icon" aria-hidden="true">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="sticky-multilayer-cart-svg"
          >
            <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </span>

        {/* Cart count badge */}
        {cart.hasItems() && (
          <span 
            className={badgeClasses}
            aria-label={`${cart.itemCount} items in cart`}
          >
            {cart.itemCount > 99 ? '99+' : cart.itemCount}
          </span>
        )}

        {/* Cart total (optional, for larger screens) */}
        <span className="sticky-multilayer-cart-total">
          {cart.getFormattedTotal()}
        </span>

        {/* Loading indicator */}
        {isLoading && (
          <span 
            className="sticky-multilayer-cart-spinner"
            aria-hidden="true"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="sticky-multilayer-cart-spinner-svg"
            >
              <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z">
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 12 12"
                  to="360 12 12"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </svg>
          </span>
        )}
      </button>

      {/* Refresh button (for debugging/manual refresh) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          className="sticky-multilayer-cart-refresh"
          onClick={handleRefreshCart}
          aria-label="Refresh cart"
          title="Refresh cart data"
        >
          ↻
        </button>
      )}
    </div>
  );
};
