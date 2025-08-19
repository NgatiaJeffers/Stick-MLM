import { WooCommerceRepository, ProductCategory } from '@domain/Repositories/WooCommerceRepository';
import { WooCommerceCart, CartItem } from '@domain/ValueObjects/WooCommerceCart';

/**
 * Infrastructure: WordPress WooCommerce Repository
 * Implements WooCommerce data access through WordPress REST API
 */
export class WordPressWooCommerceRepository implements WooCommerceRepository {
  private readonly apiBaseUrl: string;
  private readonly nonce: string;
  private cartSubscribers: ((cart: WooCommerceCart) => void)[] = [];
  private pollInterval: NodeJS.Timeout | null = null;
  private currentCart: WooCommerceCart = new WooCommerceCart();

  constructor(apiBaseUrl: string, nonce: string) {
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, '');
    this.nonce = nonce;
  }

  async getCartInfo(): Promise<WooCommerceCart> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/wc/store/v1/cart`, {
        headers: {
          'X-WP-Nonce': this.nonce,
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) {
        if (response.status === 404) {
          // WooCommerce not active or endpoint not found
          return new WooCommerceCart();
        }
        throw new Error(`Cart API error: ${response.status}`);
      }

      const data = await response.json();
      const cart = this.transformWooCommerceCartData(data);
      
      // Update current cart for subscribers
      this.currentCart = cart;
      
      return cart;

    } catch (error) {
      console.warn('Failed to get cart info:', error);
      return new WooCommerceCart();
    }
  }

  async getCartCount(): Promise<number> {
    try {
      const cart = await this.getCartInfo();
      return cart.itemCount;
    } catch (error) {
      console.warn('Failed to get cart count:', error);
      return 0;
    }
  }

  async addToCart(productId: string, quantity: number = 1): Promise<WooCommerceCart> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/wc/store/v1/cart/add-item`, {
        method: 'POST',
        headers: {
          'X-WP-Nonce': this.nonce,
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          id: productId,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error(`Add to cart failed: ${response.status}`);
      }

      const data = await response.json();
      const cart = this.transformWooCommerceCartData(data);
      
      // Notify subscribers
      this.notifySubscribers(cart);
      
      return cart;

    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  }

  async removeFromCart(cartItemId: string): Promise<WooCommerceCart> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/wc/store/v1/cart/remove-item`, {
        method: 'POST',
        headers: {
          'X-WP-Nonce': this.nonce,
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          key: cartItemId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Remove from cart failed: ${response.status}`);
      }

      const data = await response.json();
      const cart = this.transformWooCommerceCartData(data);
      
      // Notify subscribers
      this.notifySubscribers(cart);
      
      return cart;

    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  }

  async updateCartItem(cartItemId: string, quantity: number): Promise<WooCommerceCart> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/wc/store/v1/cart/update-item`, {
        method: 'POST',
        headers: {
          'X-WP-Nonce': this.nonce,
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          key: cartItemId,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error(`Update cart item failed: ${response.status}`);
      }

      const data = await response.json();
      const cart = this.transformWooCommerceCartData(data);
      
      // Notify subscribers
      this.notifySubscribers(cart);
      
      return cart;

    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  }

  async isWooCommerceActive(): Promise<boolean> {
    try {
      // Try to fetch WooCommerce store info endpoint
      const response = await fetch(`${this.apiBaseUrl}/wc/store/v1`, {
        headers: {
          'X-WP-Nonce': this.nonce,
        },
      });

      return response.ok;

    } catch (error) {
      return false;
    }
  }

  async getProductCategories(): Promise<ProductCategory[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/wc/v3/products/categories?per_page=100`, {
        headers: {
          'X-WP-Nonce': this.nonce,
        },
      });

      if (!response.ok) {
        throw new Error(`Categories API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return [];
      }

      return data.map((category: any) => ({
        id: category.id.toString(),
        name: category.name,
        slug: category.slug,
        permalink: category.permalink || `${window.location.origin}/product-category/${category.slug}`,
        parent: category.parent && category.parent !== 0 ? category.parent.toString() : null,
        count: category.count || 0,
        image: category.image?.src || undefined,
      }));

    } catch (error) {
      console.warn('Failed to get product categories:', error);
      return [];
    }
  }

  subscribeToCartUpdates(callback: (cart: WooCommerceCart) => void): () => void {
    this.cartSubscribers.push(callback);
    
    // Start polling if this is the first subscriber
    if (this.cartSubscribers.length === 1) {
      this.startCartPolling();
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.cartSubscribers.indexOf(callback);
      if (index > -1) {
        this.cartSubscribers.splice(index, 1);
      }
      
      // Stop polling if no more subscribers
      if (this.cartSubscribers.length === 0) {
        this.stopCartPolling();
      }
    };
  }

  private startCartPolling(): void {
    // Poll cart every 30 seconds
    this.pollInterval = setInterval(async () => {
      try {
        const cart = await this.getCartInfo();
        
        // Only notify if cart has actually changed
        if (this.hasCartChanged(cart, this.currentCart)) {
          this.currentCart = cart;
          this.notifySubscribers(cart);
        }
      } catch (error) {
        console.warn('Cart polling failed:', error);
      }
    }, 30000);
  }

  private stopCartPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  private hasCartChanged(newCart: WooCommerceCart, oldCart: WooCommerceCart): boolean {
    return (
      newCart.itemCount !== oldCart.itemCount ||
      newCart.totalAmount !== oldCart.totalAmount ||
      newCart.items.length !== oldCart.items.length
    );
  }

  private notifySubscribers(cart: WooCommerceCart): void {
    this.cartSubscribers.forEach(callback => {
      try {
        callback(cart);
      } catch (error) {
        console.error('Cart subscriber callback failed:', error);
      }
    });
  }

  /**
   * Transform WooCommerce REST API cart data to domain objects
   */
  private transformWooCommerceCartData(data: any): WooCommerceCart {
    const items: CartItem[] = [];
    
    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((item: any) => {
        try {
          items.push(new CartItem(
            item.key || item.id?.toString() || '',
            item.id?.toString() || item.product_id?.toString() || '',
            item.name || item.product_name || '',
            parseInt(item.quantity?.toString() || '1', 10),
            item.prices?.price || item.line_total || '0',
            item.images?.[0]?.src || undefined,
            item.permalink || undefined
          ));
        } catch (error) {
          console.warn('Failed to transform cart item:', error);
        }
      });
    }

    return new WooCommerceCart(
      parseInt(data.items_count?.toString() || data.item_count?.toString() || '0', 10),
      data.totals?.total_price || data.total || '0.00',
      data.totals?.currency_code || data.currency || 'USD',
      items,
      false, // Not loading
      new Date()
    );
  }
}
