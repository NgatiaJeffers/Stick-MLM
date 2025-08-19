import { useState, useEffect, useCallback } from 'react';
import { WooCommerceCart } from '@domain/ValueObjects/WooCommerceCart';

/**
 * Custom hook for managing WooCommerce cart state
 */
export const useWooCommerceCart = (
  onCartUpdate?: (cart: WooCommerceCart) => void
) => {
  const [cart, setCart] = useState<WooCommerceCart>(new WooCommerceCart());
  const [isLoading, setIsLoading] = useState(false);
  const [isWooCommerceActive, setIsWooCommerceActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update cart state and notify parent component
   */
  const updateCart = useCallback((newCart: WooCommerceCart) => {
    setCart(newCart);
    if (onCartUpdate) {
      onCartUpdate(newCart);
    }
  }, [onCartUpdate]);

  /**
   * Load initial cart data
   */
  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // This would be called by the application layer use case
      // For now, we'll simulate the behavior
      const event = new CustomEvent('stickymlm:load-cart');
      window.dispatchEvent(event);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add product to cart
   */
  const addToCart = useCallback(async (productId: string, quantity: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const event = new CustomEvent('stickymlm:add-to-cart', {
        detail: { productId, quantity }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(async (cartItemId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const event = new CustomEvent('stickymlm:remove-from-cart', {
        detail: { cartItemId }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove from cart');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update cart item quantity
   */
  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const event = new CustomEvent('stickymlm:update-cart-item', {
        detail: { cartItemId, quantity }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update cart item');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Listen for cart updates from the application layer
   */
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.cart) {
        updateCart(event.detail.cart);
      }
    };

    const handleWooCommerceStatus = (event: CustomEvent) => {
      if (typeof event.detail?.isActive === 'boolean') {
        setIsWooCommerceActive(event.detail.isActive);
      }
    };

    const handleCartError = (event: CustomEvent) => {
      if (event.detail && event.detail.error) {
        setError(event.detail.error);
        setIsLoading(false);
      }
    };

    // Listen for events from the application layer
    window.addEventListener('stickymlm:cart-updated', handleCartUpdate as EventListener);
    window.addEventListener('stickymlm:woocommerce-status', handleWooCommerceStatus as EventListener);
    window.addEventListener('stickymlm:cart-error', handleCartError as EventListener);

    // Load initial cart data
    loadCart();

    return () => {
      window.removeEventListener('stickymlm:cart-updated', handleCartUpdate as EventListener);
      window.removeEventListener('stickymlm:woocommerce-status', handleWooCommerceStatus as EventListener);
      window.removeEventListener('stickymlm:cart-error', handleCartError as EventListener);
    };
  }, [loadCart, updateCart]);

  /**
   * Get formatted cart count for display
   */
  const getCartCountDisplay = useCallback((): string => {
    if (cart.itemCount === 0) return '0';
    if (cart.itemCount > 99) return '99+';
    return cart.itemCount.toString();
  }, [cart.itemCount]);

  /**
   * Check if cart should show notification badge
   */
  const shouldShowBadge = useCallback((): boolean => {
    return cart.hasItems() && isWooCommerceActive;
  }, [cart, isWooCommerceActive]);

  return {
    // State
    cart,
    isLoading,
    isWooCommerceActive,
    error,
    
    // Actions
    loadCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    
    // Computed
    cartCount: cart.itemCount,
    cartTotal: cart.getFormattedTotal(),
    isEmpty: cart.isEmpty(),
    hasItems: cart.hasItems(),
    cartCountDisplay: getCartCountDisplay(),
    shouldShowBadge: shouldShowBadge(),
    
    // Helpers
    isStale: cart.isStale(),
  };
};
