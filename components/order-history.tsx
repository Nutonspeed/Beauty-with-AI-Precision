'use client';

import { useState, useEffect } from 'react';
import { Order, OrderTimeline } from '@/lib/ecommerce/order-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderHistoryProps {
  orders: Order[];
  onTrackOrder: (orderId: string) => { order: Order | null; timeline: OrderTimeline[] };
  onCancelOrder: (orderId: string, reason?: string) => boolean;
}

export function OrderHistory({
  orders,
  onTrackOrder,
  onCancelOrder,
}: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
          <p className="text-gray-500">Your order history will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Order History</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onTrackOrder={onTrackOrder}
            onCancelOrder={onCancelOrder}
          />
        ))}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onTrackOrder,
  onCancelOrder,
}: {
  order: Order;
  onTrackOrder: (orderId: string) => { order: Order | null; timeline: OrderTimeline[] };
  onCancelOrder: (orderId: string, reason?: string) => boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [timeline, setTimeline] = useState<OrderTimeline[]>([]);

  const handleTrackOrder = () => {
    const result = onTrackOrder(order.id);
    setTimeline(result.timeline);
    setShowTracking(!showTracking);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={styles[status as keyof typeof styles] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(order.status)}
              Order #{order.id}
            </CardTitle>
            <p className="text-sm text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right space-y-2">
            {getStatusBadge(order.status)}
            <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-2">
          {order.items.slice(0, expanded ? undefined : 2).map((item) => (
            <div key={item.productId} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-16 w-16 bg-white rounded flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}

          {order.items.length > 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show {order.items.length - 2} More Items
                </>
              )}
            </Button>
          )}
        </div>

        {/* Shipping Address */}
        {expanded && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Shipping Address</h4>
            <p className="text-sm">{order.shippingAddress.fullName}</p>
            <p className="text-sm">{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p className="text-sm">{order.shippingAddress.addressLine2}</p>
            )}
            <p className="text-sm">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
            </p>
            <p className="text-sm">{order.shippingAddress.country}</p>
          </div>
        )}

        {/* Tracking */}
        {order.trackingNumber && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold">Tracking Number</p>
            <p className="text-sm font-mono">{order.trackingNumber}</p>
          </div>
        )}

        {/* Timeline */}
        {showTracking && timeline.length > 0 && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold">Order Timeline</h4>
            <div className="space-y-3">
              {timeline.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      event.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      {event.completed ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Clock className="h-5 w-5 text-white" />
                      )}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className={`w-0.5 h-12 ${
                        event.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {order.trackingNumber && (
            <Button variant="outline" onClick={handleTrackOrder}>
              {showTracking ? 'Hide Tracking' : 'Track Order'}
            </Button>
          )}
          
          {(order.status === 'pending' || order.status === 'processing') && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm('Are you sure you want to cancel this order?')) {
                  onCancelOrder(order.id, 'Changed my mind');
                }
              }}
            >
              Cancel Order
            </Button>
          )}

          {!expanded && (
            <Button variant="ghost" onClick={() => setExpanded(true)} className="ml-auto">
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
