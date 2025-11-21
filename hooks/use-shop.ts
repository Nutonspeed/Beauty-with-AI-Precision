// @ts-nocheck
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProductManager, Product, ProductFilter, ProductSort, AIRecommendation, ProductReview } from '@/lib/ecommerce/product-manager';
import { CartManager, Cart, ShippingOption, SHIPPING_OPTIONS } from '@/lib/ecommerce/cart-manager';
import { OrderManager, Order, Address, PaymentMethod } from '@/lib/ecommerce/order-manager';

const productManager = new ProductManager();
const cartManager = new CartManager();
const orderManager = new OrderManager();

export function useShop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
    itemCount: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize
  useEffect(() => {
    const allProducts = productManager.getAllProducts();
    setProducts(allProducts);
    setFilteredProducts(allProducts);
    
    // Load cart from storage
    cartManager.loadFromStorage();
    updateCart();
  }, [updateCart]);

  // Update cart state
  const updateCart = useCallback(() => {
    const currentCart = cartManager.getCart();
    setCart(currentCart);
  }, []);

  // Search products
  const searchProducts = useCallback((filter?: ProductFilter, sort?: ProductSort) => {
    const results = productManager.searchProducts(filter, sort);
    setFilteredProducts(results);
  }, []);

  // Get product by ID
  const getProduct = useCallback((productId: string) => {
    return productManager.getProduct(productId);
  }, []);

  // View product details
  const viewProduct = useCallback((productId: string) => {
    const product = productManager.getProduct(productId);
    if (product) {
      setSelectedProduct(product);
      
      // Track browsing
      productManager.trackBrowsing('current-user', productId);
      
      // Get recommendations
      const recs = productManager.getRecommendations('current-user', 4);
      setRecommendations(recs);
    }
  }, []);

  // Add to cart
  const addToCart = useCallback((product: Product, quantity = 1) => {
    const success = cartManager.addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      inStock: product.stock > 0,
      maxQuantity: product.stock,
    }, quantity);

    if (success) {
      cartManager.saveToStorage();
      updateCart();
      return true;
    }
    return false;
  }, [updateCart]);

  // Remove from cart
  const removeFromCart = useCallback((productId: string) => {
    cartManager.removeItem(productId);
    cartManager.saveToStorage();
    updateCart();
  }, [updateCart]);

  // Update cart quantity
  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    const success = cartManager.updateQuantity(productId, quantity);
    if (success) {
      cartManager.saveToStorage();
      updateCart();
    }
    return success;
  }, [updateCart]);

  // Set shipping option
  const setShipping = useCallback((option: ShippingOption) => {
    cartManager.setShipping(option);
    cartManager.saveToStorage();
    updateCart();
  }, [updateCart]);

  // Clear cart
  const clearCart = useCallback(() => {
    cartManager.clear();
    cartManager.saveToStorage();
    updateCart();
  }, [updateCart]);

  // Place order
  const placeOrder = useCallback(async (
    shippingAddress: Address,
    billingAddress: Address,
    paymentMethod: PaymentMethod,
    notes?: string
  ) => {
    setLoading(true);

    try {
      const cartData = cartManager.getCart();
      
      const order = await orderManager.createOrder(
        'current-user',
        cartData.items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        cartData.subtotal,
        cartData.shipping,
        cartData.tax,
        paymentMethod,
        shippingAddress,
        billingAddress,
        notes
      );

      // Track purchase
      productManager.trackPurchase(
        'current-user',
        cartData.items.map(item => item.productId)
      );

      // Decrease stock
      for (const item of cartData.items) {
        productManager.decreaseStock(item.productId, item.quantity);
      }

      // Clear cart
      clearCart();

      setCurrentOrder(order);
      setLoading(false);

      return order;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [clearCart]);

  // Get user orders
  const getUserOrders = useCallback(() => {
    const userOrders = orderManager.getUserOrders('current-user');
    setOrders(userOrders);
    return userOrders;
  }, []);

  // Track order
  const trackOrder = useCallback((orderId: string) => {
    return orderManager.trackOrder(orderId);
  }, []);

  // Cancel order
  const cancelOrder = useCallback((orderId: string, reason?: string) => {
    const success = orderManager.cancelOrder(orderId, reason);
    if (success) {
      getUserOrders();
    }
    return success;
  }, [getUserOrders]);

  // Get order stats
  const getOrderStats = useCallback(() => {
    return orderManager.getOrderStats('current-user');
  }, []);

  // Get product reviews
  const getProductReviews = useCallback((productId: string) => {
    return productManager.getProductReviews(productId);
  }, []);

  // Add product review
  const addReview = useCallback((review: Omit<ProductReview, 'id' | 'createdAt' | 'updatedAt'>) => {
    productManager.addReview(review);
    
    // Refresh product if viewing
    if (selectedProduct && selectedProduct.id === review.productId) {
      const updated = productManager.getProduct(review.productId);
      if (updated) setSelectedProduct(updated);
    }
  }, [selectedProduct]);

  // Get categories
  const getCategories = useCallback(() => {
    return productManager.getCategories();
  }, []);

  // Get brands
  const getBrands = useCallback(() => {
    return productManager.getBrands();
  }, []);

  // Get price range
  const getPriceRange = useCallback(() => {
    return productManager.getPriceRange();
  }, []);

  return {
    // Products
    products,
    filteredProducts,
    selectedProduct,
    searchProducts,
    getProduct,
    viewProduct,
    getCategories,
    getBrands,
    getPriceRange,

    // Cart
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    setShipping,
    clearCart,
    shippingOptions: SHIPPING_OPTIONS,

    // Orders
    orders,
    currentOrder,
    placeOrder,
    getUserOrders,
    trackOrder,
    cancelOrder,
    getOrderStats,

    // Reviews
    getProductReviews,
    addReview,

    // Recommendations
    recommendations,

    // State
    loading,
  };
}
