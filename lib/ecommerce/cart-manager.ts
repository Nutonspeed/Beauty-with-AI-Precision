// Shopping Cart Manager
// Manages cart items, quantities, and totals

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  inStock: boolean;
  maxQuantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

export class CartManager {
  private items: Map<string, CartItem> = new Map();
  private shippingOption: ShippingOption | null = null;
  private taxRate = 0.07; // 7% tax

  /**
   * Add item to cart
   */
  addItem(item: Omit<CartItem, 'quantity'>, quantity = 1): boolean {
    const existingItem = this.items.get(item.productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > item.maxQuantity) {
        return false; // Cannot exceed max quantity
      }

      existingItem.quantity = newQuantity;
    } else {
      if (quantity > item.maxQuantity) {
        return false;
      }

      this.items.set(item.productId, {
        ...item,
        quantity,
      });
    }

    return true;
  }

  /**
   * Remove item from cart
   */
  removeItem(productId: string): boolean {
    return this.items.delete(productId);
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId: string, quantity: number): boolean {
    const item = this.items.get(productId);
    if (!item) return false;

    if (quantity <= 0) {
      return this.removeItem(productId);
    }

    if (quantity > item.maxQuantity) {
      return false;
    }

    item.quantity = quantity;
    return true;
  }

  /**
   * Get cart items
   */
  getItems(): CartItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Get cart summary
   */
  getCart(): Cart {
    const items = this.getItems();
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = this.shippingOption?.price || 0;
    const tax = subtotal * this.taxRate;
    const total = subtotal + shipping + tax;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      subtotal,
      shipping,
      tax,
      total,
      itemCount,
    };
  }

  /**
   * Set shipping option
   */
  setShipping(option: ShippingOption): void {
    this.shippingOption = option;
  }

  /**
   * Get shipping option
   */
  getShipping(): ShippingOption | null {
    return this.shippingOption;
  }

  /**
   * Clear cart
   */
  clear(): void {
    this.items.clear();
    this.shippingOption = null;
  }

  /**
   * Get item count
   */
  getItemCount(): number {
    return Array.from(this.items.values()).reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Check if product is in cart
   */
  hasItem(productId: string): boolean {
    return this.items.has(productId);
  }

  /**
   * Get item quantity
   */
  getItemQuantity(productId: string): number {
    return this.items.get(productId)?.quantity || 0;
  }

  /**
   * Save to local storage
   */
  saveToStorage(): void {
    if (typeof window === 'undefined') return;

    const cartData = {
      items: Array.from(this.items.entries()),
      shippingOption: this.shippingOption,
    };

    localStorage.setItem('cart', JSON.stringify(cartData));
  }

  /**
   * Load from local storage
   */
  loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    const cartData = localStorage.getItem('cart');
    if (!cartData) return;

    try {
      const data = JSON.parse(cartData);
      this.items = new Map(data.items);
      this.shippingOption = data.shippingOption;
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    }
  }
}

/**
 * Available shipping options
 */
export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    price: 5.99,
    estimatedDays: '5-7 business days',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    price: 12.99,
    estimatedDays: '2-3 business days',
  },
  {
    id: 'overnight',
    name: 'Overnight Shipping',
    price: 24.99,
    estimatedDays: '1 business day',
  },
  {
    id: 'free',
    name: 'Free Shipping',
    price: 0,
    estimatedDays: '7-10 business days',
  },
];
