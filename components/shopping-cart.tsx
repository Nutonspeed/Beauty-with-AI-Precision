'use client';

import { Cart as CartType, CartItem } from '@/lib/ecommerce/cart-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

interface ShoppingCartProps {
  cart: CartType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export function ShoppingCart({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
}: ShoppingCartProps) {
  if (cart.items.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some products to get started</p>
          <Button onClick={onContinueShopping}>Continue Shopping</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Shopping Cart ({cart.itemCount} items)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.items.map((item) => (
              <CartItemCard
                key={item.productId}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemove={onRemoveItem}
              />
            ))}
          </CardContent>
        </Card>

        <Button variant="outline" onClick={onContinueShopping} className="w-full">
          Continue Shopping
        </Button>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {cart.shipping === 0 ? 'FREE' : `$${cart.shipping.toFixed(2)}`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (7%)</span>
                <span className="font-medium">${cart.tax.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">${cart.total.toFixed(2)}</span>
              </div>
            </div>

            <Button onClick={onCheckout} className="w-full" size="lg">
              Proceed to Checkout
            </Button>

            <div className="text-xs text-gray-500 text-center">
              Secure checkout powered by Stripe
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <div className="h-24 w-24 bg-gray-100 rounded-md flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover rounded-md"
        />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <h3 className="font-semibold">{item.name}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.productId)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                onUpdateQuantity(item.productId, value);
              }}
              className="w-16 text-center"
              min={1}
              max={item.maxQuantity}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.maxQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-right">
            <div className="font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
            <div className="text-sm text-gray-500">${item.price} each</div>
          </div>
        </div>

        {!item.inStock && (
          <p className="text-sm text-red-600">Out of stock</p>
        )}
        {item.quantity >= item.maxQuantity && (
          <p className="text-sm text-orange-600">Maximum quantity reached</p>
        )}
      </div>
    </div>
  );
}
