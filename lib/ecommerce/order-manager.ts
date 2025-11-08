// Order Manager
// Handles order creation, payment processing, and order management

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export type OrderStatus = 
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'bank_transfer'
  | 'cash_on_delivery';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVV?: string;
  paypalEmail?: string;
}

export class OrderManager {
  private orders: Map<string, Order> = new Map();

  /**
   * Create new order
   */
  async createOrder(
    userId: string,
    items: OrderItem[],
    subtotal: number,
    shipping: number,
    tax: number,
    paymentMethod: PaymentMethod,
    shippingAddress: Address,
    billingAddress: Address,
    notes?: string
  ): Promise<Order> {
    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userId,
      items,
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax,
      status: 'pending',
      paymentMethod,
      paymentStatus: 'pending',
      shippingAddress,
      billingAddress,
      notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.orders.set(order.id, order);

    // Simulate payment processing
    setTimeout(() => {
      this.processPayment(order.id);
    }, 2000);

    return order;
  }

  /**
   * Process payment
   */
  private async processPayment(orderId: string): Promise<void> {
    const order = this.orders.get(orderId);
    if (!order) return;

    // Simulate payment processing
    order.paymentStatus = 'processing';
    order.updatedAt = Date.now();

    // Simulate success (90% success rate)
    setTimeout(() => {
      if (Math.random() > 0.1) {
        order.paymentStatus = 'completed';
        order.status = 'processing';
        
        // Generate tracking number
        order.trackingNumber = `TRK-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
      } else {
        order.paymentStatus = 'failed';
        order.status = 'cancelled';
      }
      
      order.updatedAt = Date.now();
    }, 3000);
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): Order | null {
    return this.orders.get(orderId) || null;
  }

  /**
   * Get user orders
   */
  getUserOrders(userId: string): Order[] {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: OrderStatus): boolean {
    const order = this.orders.get(orderId);
    if (!order) return false;

    order.status = status;
    order.updatedAt = Date.now();

    return true;
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: string, reason?: string): boolean {
    const order = this.orders.get(orderId);
    if (!order) return false;

    // Can only cancel if not shipped
    if (order.status === 'shipped' || order.status === 'delivered') {
      return false;
    }

    order.status = 'cancelled';
    order.notes = reason ? `Cancelled: ${reason}` : 'Cancelled by user';
    order.updatedAt = Date.now();

    return true;
  }

  /**
   * Request refund
   */
  requestRefund(orderId: string, reason: string): boolean {
    const order = this.orders.get(orderId);
    if (!order) return false;

    // Can only refund completed orders
    if (order.paymentStatus !== 'completed') {
      return false;
    }

    order.paymentStatus = 'refunded';
    order.status = 'refunded';
    order.notes = `Refund requested: ${reason}`;
    order.updatedAt = Date.now();

    return true;
  }

  /**
   * Track order
   */
  trackOrder(orderId: string): {
    order: Order | null;
    timeline: OrderTimeline[];
  } {
    const order = this.orders.get(orderId) || null;
    if (!order) {
      return { order: null, timeline: [] };
    }

    const timeline = this.generateTimeline(order);

    return { order, timeline };
  }

  /**
   * Generate order timeline
   */
  private generateTimeline(order: Order): OrderTimeline[] {
    const timeline: OrderTimeline[] = [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'Your order has been received',
        timestamp: order.createdAt,
        completed: true,
      },
    ];

    if (order.paymentStatus === 'completed') {
      timeline.push({
        status: 'processing',
        title: 'Payment Confirmed',
        description: 'Payment has been processed successfully',
        timestamp: order.createdAt + 5000,
        completed: true,
      });
    }

    if (order.status === 'processing') {
      timeline.push({
        status: 'processing',
        title: 'Processing',
        description: 'Your order is being prepared',
        timestamp: order.createdAt + 10000,
        completed: true,
      });
    }

    if (order.status === 'shipped') {
      timeline.push({
        status: 'shipped',
        title: 'Shipped',
        description: `Tracking: ${order.trackingNumber}`,
        timestamp: order.createdAt + 86400000,
        completed: true,
      });
    }

    if (order.status === 'delivered') {
      timeline.push({
        status: 'delivered',
        title: 'Delivered',
        description: 'Order has been delivered',
        timestamp: order.createdAt + 259200000,
        completed: true,
      });
    }

    if (order.status === 'cancelled') {
      timeline.push({
        status: 'cancelled',
        title: 'Cancelled',
        description: order.notes || 'Order has been cancelled',
        timestamp: order.updatedAt,
        completed: true,
      });
    }

    return timeline;
  }

  /**
   * Get order statistics
   */
  getOrderStats(userId: string): OrderStats {
    const userOrders = this.getUserOrders(userId);

    return {
      totalOrders: userOrders.length,
      totalSpent: userOrders.reduce((sum, order) => sum + order.total, 0),
      pendingOrders: userOrders.filter(o => o.status === 'pending').length,
      completedOrders: userOrders.filter(o => o.status === 'delivered').length,
      cancelledOrders: userOrders.filter(o => o.status === 'cancelled').length,
    };
  }
}

export interface OrderTimeline {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: number;
  completed: boolean;
}

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}
