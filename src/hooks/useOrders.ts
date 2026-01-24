import { useCallback, useEffect } from 'react';
import { Order, GroceryItem, PaymentMethod, OrderStatus } from '@/types/grocery';
import { useLocalStorage } from './useLocalStorage';
import { addHours } from 'date-fns';

// Order status progression
const STATUS_PROGRESSION: OrderStatus[] = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];

// Time intervals for status changes (in milliseconds)
const STATUS_INTERVALS: Record<OrderStatus, number> = {
  'confirmed': 30000,      // 30 seconds to preparing
  'preparing': 60000,      // 1 minute to out_for_delivery
  'out_for_delivery': 90000, // 1.5 minutes to delivered
  'delivered': 0,          // No change after delivery
};

export function useOrders() {
  const [orders, setOrders] = useLocalStorage<Order[]>('primemart-orders', []);

  // Auto-progress orders through statuses
  useEffect(() => {
    const progressOrders = () => {
      setOrders(prev => {
        let hasChanges = false;
        const updatedOrders = prev.map(order => {
          if (order.status === 'delivered') return order;
          
          const orderCreatedAt = new Date(order.createdAt).getTime();
          const now = Date.now();
          const elapsedTime = now - orderCreatedAt;
          
          // Calculate what status the order should be at based on elapsed time
          let cumulativeTime = 0;
          let targetStatus: OrderStatus = 'confirmed';
          
          for (const status of STATUS_PROGRESSION) {
            if (status === 'delivered') {
              if (elapsedTime > cumulativeTime + STATUS_INTERVALS['out_for_delivery']) {
                targetStatus = 'delivered';
              }
              break;
            }
            cumulativeTime += STATUS_INTERVALS[status];
            if (elapsedTime > cumulativeTime) {
              const nextIndex = STATUS_PROGRESSION.indexOf(status) + 1;
              if (nextIndex < STATUS_PROGRESSION.length) {
                targetStatus = STATUS_PROGRESSION[nextIndex];
              }
            }
          }
          
          if (order.status !== targetStatus) {
            hasChanges = true;
            return { ...order, status: targetStatus };
          }
          return order;
        });
        
        // Remove delivered orders after 2 minutes
        const filteredOrders = updatedOrders.filter(order => {
          if (order.status !== 'delivered') return true;
          const orderCreatedAt = new Date(order.createdAt).getTime();
          const timeSinceCreation = Date.now() - orderCreatedAt;
          const totalOrderTime = STATUS_INTERVALS.confirmed + STATUS_INTERVALS.preparing + STATUS_INTERVALS.out_for_delivery + 120000; // +2 min after delivery
          return timeSinceCreation < totalOrderTime;
        });
        
        if (hasChanges || filteredOrders.length !== prev.length) {
          return filteredOrders;
        }
        return prev;
      });
    };

    // Run immediately and then every 10 seconds
    progressOrders();
    const interval = setInterval(progressOrders, 10000);

    return () => clearInterval(interval);
  }, [setOrders]);

  const createOrder = useCallback((
    items: GroceryItem[],
    paymentMethod: PaymentMethod,
    totals: { subtotal: number; tax: number; savings: number; total: number }
  ): Order => {
    const newOrder: Order = {
      id: crypto.randomUUID(),
      items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      savings: totals.savings,
      total: totals.total,
      paymentMethod,
      status: 'confirmed',
      createdAt: new Date(),
      estimatedDelivery: addHours(new Date(), 2),
      deliveryAddress: '123 Smart Street, Cart City, SC 12345',
    };

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, [setOrders]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      )
    );
  }, [setOrders]);

  const getActiveOrder = useCallback(() => {
    return orders.find(order => order.status !== 'delivered');
  }, [orders]);

  const getRecentOrders = useCallback((limit = 10) => {
    return orders.slice(0, limit);
  }, [orders]);

  const removeOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  }, [setOrders]);

  return {
    orders,
    createOrder,
    updateOrderStatus,
    getActiveOrder,
    getRecentOrders,
    removeOrder,
  };
}