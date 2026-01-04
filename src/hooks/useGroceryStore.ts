import { useState, useCallback, useMemo } from 'react';
import { GroceryItem, Budget } from '@/types/grocery';
import { sampleGroceryItems } from '@/data/mockData';

export function useGroceryStore() {
  const [items, setItems] = useState<GroceryItem[]>(sampleGroceryItems);
  const [budget, setBudget] = useState<Budget>({
    total: 100,
    spent: 0,
    remaining: 100,
  });

  const addItem = useCallback((item: Omit<GroceryItem, 'id' | 'addedAt' | 'isChecked'>) => {
    const newItem: GroceryItem = {
      ...item,
      id: crypto.randomUUID(),
      addedAt: new Date(),
      isChecked: false,
    };
    setItems(prev => [newItem, ...prev]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  }, []);

  const clearChecked = useCallback(() => {
    setItems(prev => prev.filter(item => !item.isChecked));
  }, []);

  const stats = useMemo(() => {
    const totalItems = items.length;
    const checkedItems = items.filter(i => i.isChecked).length;
    const totalPrice = items.reduce((sum, item) => {
      const price = item.hasDeal && item.dealPrice ? item.dealPrice : item.price;
      return sum + price * item.quantity;
    }, 0);
    const savings = items.reduce((sum, item) => {
      if (item.hasDeal && item.dealPrice) {
        return sum + (item.price - item.dealPrice) * item.quantity;
      }
      return sum;
    }, 0);
    const healthyCount = items.filter(i => i.isHealthy).length;
    const dealsCount = items.filter(i => i.hasDeal).length;

    return {
      totalItems,
      checkedItems,
      totalPrice,
      savings,
      healthyCount,
      dealsCount,
      progress: totalItems > 0 ? (checkedItems / totalItems) * 100 : 0,
    };
  }, [items]);

  const updateBudget = useCallback((total: number) => {
    setBudget(prev => ({
      total,
      spent: prev.spent,
      remaining: total - prev.spent,
    }));
  }, []);

  return {
    items,
    budget,
    stats,
    addItem,
    removeItem,
    toggleItem,
    updateQuantity,
    clearChecked,
    updateBudget,
  };
}
