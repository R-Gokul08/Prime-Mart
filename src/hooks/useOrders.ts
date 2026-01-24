import { useCallback } from 'react';
import { Order, GroceryItem, PaymentMethod, OrderStatus } from '@/types/grocery';
import { useLocalStorage } from './useLocalStorage';
import { addHours } from 'date-fns';

export function useOrders() {
  const [orders, setOrders] = useLocalStorage<Order[]>('smartcart-orders', []);

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

  return {
    orders,
    createOrder,
    updateOrderStatus,
    getActiveOrder,
    getRecentOrders,
  };
}