import { WooCommerceRepository } from '@domain/Repositories/WooCommerceRepository';
import { WooCommerceCart } from '@domain/ValueObjects/WooCommerceCart';

/**
 * Application Use Case: SyncWooCommerceCart
 * Synchronizes WooCommerce cart data with the menu system
 */
export class SyncWooCommerceCart {
  constructor(
    private readonly wooCommerceRepository: WooCommerceRepository
  ) {}

  async execute(): Promise<SyncWooCommerceCartResult> {
    try {
      // Check if WooCommerce is active
      const isWooCommerceActive = await this.wooCommerceRepository.isWooCommerceActive();
      
      if (!isWooCommerceActive) {
        return {
          success: true,
          error: null,
          cart: new WooCommerceCart(), // Empty cart
          isWooCommerceActive: false
        };
      }

      // Get current cart information
      const cart = await this.wooCommerceRepository.getCartInfo();

      return {
        success: true,
        error: null,
        cart,
        isWooCommerceActive: true
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error syncing WooCommerce cart',
        cart: new WooCommerceCart(), // Empty cart as fallback
        isWooCommerceActive: false
      };
    }
  }

  /**
   * Subscribe to real-time cart updates
   */
  subscribeToUpdates(callback: (cart: WooCommerceCart) => void): () => void {
    return this.wooCommerceRepository.subscribeToCartUpdates(callback);
  }
}

export interface SyncWooCommerceCartResult {
  success: boolean;
  error: string | null;
  cart: WooCommerceCart;
  isWooCommerceActive: boolean;
}
