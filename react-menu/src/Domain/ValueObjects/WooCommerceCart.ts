/**
 * Domain Value Object: WooCommerceCart
 * Represents the current state of the WooCommerce cart
 */
export class WooCommerceCart {
  constructor(
    public readonly itemCount: number = 0,
    public readonly totalAmount: string = '0.00',
    public readonly currency: string = 'USD',
    public readonly items: CartItem[] = [],
    public readonly isLoading: boolean = false,
    public readonly lastUpdated: Date = new Date()
  ) {
    if (itemCount < 0) {
      throw new Error('Cart item count cannot be negative');
    }
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this.itemCount === 0;
  }

  /**
   * Check if cart has items
   */
  hasItems(): boolean {
    return this.itemCount > 0;
  }

  /**
   * Get formatted total amount
   */
  getFormattedTotal(): string {
    return `${this.currency} ${this.totalAmount}`;
  }

  /**
   * Create new cart state with updated item count
   */
  withItemCount(count: number): WooCommerceCart {
    return new WooCommerceCart(
      Math.max(0, count),
      this.totalAmount,
      this.currency,
      this.items,
      this.isLoading,
      new Date()
    );
  }

  /**
   * Create new cart state with loading status
   */
  withLoading(isLoading: boolean): WooCommerceCart {
    return new WooCommerceCart(
      this.itemCount,
      this.totalAmount,
      this.currency,
      this.items,
      isLoading,
      this.lastUpdated
    );
  }

  /**
   * Create new cart state with updated data
   */
  withUpdatedData(
    itemCount: number,
    totalAmount: string,
    items: CartItem[] = []
  ): WooCommerceCart {
    return new WooCommerceCart(
      Math.max(0, itemCount),
      totalAmount,
      this.currency,
      items,
      false, // Loading complete
      new Date()
    );
  }

  /**
   * Check if cart data is stale (older than 5 minutes)
   */
  isStale(): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.lastUpdated < fiveMinutesAgo;
  }
}

/**
 * Value Object: CartItem
 * Represents a single item in the WooCommerce cart
 */
export class CartItem {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly name: string,
    public readonly quantity: number,
    public readonly price: string,
    public readonly image?: string,
    public readonly permalink?: string
  ) {
    if (quantity <= 0) {
      throw new Error('Cart item quantity must be positive');
    }
  }

  /**
   * Get total price for this item (quantity * unit price)
   */
  getTotalPrice(): number {
    return parseFloat(this.price) * this.quantity;
  }

  /**
   * Create new cart item with updated quantity
   */
  withQuantity(quantity: number): CartItem {
    if (quantity <= 0) {
      throw new Error('Cart item quantity must be positive');
    }
    
    return new CartItem(
      this.id,
      this.productId,
      this.name,
      quantity,
      this.price,
      this.image,
      this.permalink
    );
  }
}
