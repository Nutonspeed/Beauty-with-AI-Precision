'use client';

import { useState, useEffect } from 'react';
import { useShop } from '@/hooks/use-shop';
import { ProductCatalog } from '@/components/product-catalog';
import { ShoppingCart } from '@/components/shopping-cart';
import { CheckoutForm } from '@/components/checkout-form';
import { OrderHistory } from '@/components/order-history';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, ShoppingCart as CartIcon, Package, CheckCircle } from 'lucide-react';

type View = 'catalog' | 'cart' | 'checkout' | 'success' | 'orders';

export default function ShopDemoPage() {
  const {
    products,
    filteredProducts,
    cart,
    searchProducts,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    setShipping,
    clearCart,
    shippingOptions,
    placeOrder,
    currentOrder,
    orders,
    getUserOrders,
    trackOrder,
    cancelOrder,
    getCategories,
    getBrands,
    getPriceRange,
    viewProduct,
    loading,
  } = useShop();

  const [view, setView] = useState<View>('catalog');
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });

  useEffect(() => {
    setCategories(getCategories());
    setBrands(getBrands());
    setPriceRange(getPriceRange());
    getUserOrders();
  }, []);

  // Auto-select standard shipping
  useEffect(() => {
    if (cart.items.length > 0 && !cart.shipping) {
      const standardShipping = shippingOptions.find(opt => opt.id === 'standard');
      if (standardShipping) {
        setShipping(standardShipping);
      }
    }
  }, [cart.items.length, cart.shipping, shippingOptions, setShipping]);

  const handleSearch = (query: string, options: any) => {
    searchProducts(options.filter, options.sort);
  };

  const handleAddToCart = (product: any) => {
    const success = addToCart(product, 1);
    if (success) {
      alert(`${product.name} added to cart!`);
    } else {
      alert('Failed to add to cart. Maximum quantity reached.');
    }
  };

  const handleCheckout = async (
    shippingAddress: any,
    billingAddress: any,
    paymentMethod: any,
    notes?: string
  ) => {
    try {
      await placeOrder(shippingAddress, billingAddress, paymentMethod, notes);
      setView('success');
      getUserOrders();
    } catch (error) {
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">E-Commerce Store</h1>
          <p className="text-gray-600">Browse products, add to cart, and checkout</p>
        </div>
        
        {view !== 'cart' && view !== 'checkout' && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => setView('cart')}
            className="relative"
          >
            <CartIcon className="h-5 w-5 mr-2" />
            Cart
            {cart.itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                {cart.itemCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <Tabs value={view} onValueChange={(v) => setView(v as View)}>
        <TabsList>
          <TabsTrigger value="catalog">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Shop
          </TabsTrigger>
          <TabsTrigger value="cart">
            <CartIcon className="h-4 w-4 mr-2" />
            Cart {cart.itemCount > 0 && `(${cart.itemCount})`}
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" />
            Orders {orders.length > 0 && `(${orders.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Product Catalog */}
        <TabsContent value="catalog" className="mt-6">
          <ProductCatalog
            products={filteredProducts}
            onSearch={handleSearch}
            onAddToCart={handleAddToCart}
            onViewProduct={(id) => {
              viewProduct(id);
              // Could show product detail modal here
            }}
            categories={categories}
            brands={brands}
            priceRange={priceRange}
          />
        </TabsContent>

        {/* Shopping Cart */}
        <TabsContent value="cart" className="mt-6">
          <ShoppingCart
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onCheckout={() => setView('checkout')}
            onContinueShopping={() => setView('catalog')}
          />
        </TabsContent>

        {/* Orders */}
        <TabsContent value="orders" className="mt-6">
          <OrderHistory
            orders={orders}
            onTrackOrder={trackOrder}
            onCancelOrder={cancelOrder}
          />
        </TabsContent>
      </Tabs>

      {/* Checkout */}
      {view === 'checkout' && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-6">Checkout</h2>
          <CheckoutForm
            cart={cart}
            onPlaceOrder={handleCheckout}
            onBack={() => setView('cart')}
            loading={loading}
          />
        </div>
      )}

      {/* Order Success */}
      {view === 'success' && currentOrder && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-6">
            <CheckCircle className="h-20 w-20 text-green-500" />
            
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Order Placed Successfully!</h2>
              <p className="text-gray-600">Thank you for your purchase</p>
            </div>

            <div className="w-full max-w-md space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-mono font-semibold">{currentOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">${currentOrder.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <Badge>{currentOrder.paymentStatus}</Badge>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center">
                We've sent a confirmation email with your order details.
                Your order will be processed shortly.
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setView('orders')}>
                View Orders
              </Button>
              <Button variant="outline" onClick={() => setView('catalog')}>
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Footer */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">{products.length}</p>
              <p className="text-sm text-gray-600">Products</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">{cart.itemCount}</p>
              <p className="text-sm text-gray-600">Items in Cart</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">{orders.length}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">
                ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(0)}
              </p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
