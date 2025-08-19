import { WooCommerceCart } from '../ValueObjects/WooCommerceCart';

/**
 * Domain Repository Interface: WooCommerceRepository
 * Defines operations for WooCommerce data retrieval
 */
export interface WooCommerceRepository {
  /**
   * Get current cart information
   */
  getCartInfo(): Promise<WooCommerceCart>;
  
  /**
   * Get cart item count
   */
  getCartCount(): Promise<number>;
  
  /**
   * Add product to cart
   */
  addToCart(productId: string, quantity?: number): Promise<WooCommerceCart>;
  
  /**
   * Remove item from cart
   */
  removeFromCart(cartItemId: string): Promise<WooCommerceCart>;
  
  /**
   * Update cart item quantity
   */
  updateCartItem(cartItemId: string, quantity: number): Promise<WooCommerceCart>;
  
  /**
   * Check if WooCommerce is active
   */
  isWooCommerceActive(): Promise<boolean>;
  
  /**
   * Get WooCommerce product categories for menu integration
   */
  getProductCategories(): Promise<ProductCategory[]>;
  
  /**
   * Subscribe to cart updates (for real-time updates)
   */
  subscribeToCartUpdates(callback: (cart: WooCommerceCart) => void): () => void;
}

/**
 * Value Object: ProductCategory
 * Represents a WooCommerce product category for menu integration
 */
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  permalink: string;
  parent: string | null;
  count: number;
  image?: string;
}
