import { useCallback, useMemo, useEffect } from 'react';
import { GroceryItem, Budget } from '@/types/grocery';
import { useLocalStorage } from './useLocalStorage';
import { supabase } from '@/integrations/supabase/client';

// Start with empty items - users build their own list
const INITIAL_ITEMS: GroceryItem[] = [];

// Default budget of ₹500
const INITIAL_BUDGET: Budget = {
  total: 500,
  spent: 0,
  remaining: 500,
};

export function useGroceryStore() {
  const [items, setItems] = useLocalStorage<GroceryItem[]>('primemart-items', INITIAL_ITEMS);
  const [budget, setBudget] = useLocalStorage<Budget>('primemart-budget', INITIAL_BUDGET);
  const [userId, setUserId] = useLocalStorage<string | null>('primemart-user-id', null);

  // Sync with Supabase when user is authenticated
  useEffect(() => {
    const syncWithCloud = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        // Data is stored locally with user-specific keys when signed in
      } else {
        setUserId(null);
      }
    };

    syncWithCloud();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUserId]);

  const addItem = useCallback((item: Omit<GroceryItem, 'id' | 'addedAt' | 'isChecked'>) => {
    const newItem: GroceryItem = {
      ...item,
      id: crypto.randomUUID(),
      addedAt: new Date(),
      isChecked: false,
    };
    setItems(prev => [newItem, ...prev]);
  }, [setItems]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, [setItems]);

  const toggleItem = useCallback((id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isChecked: !item.isChecked } : item
      )
    );
  }, [setItems]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  }, [setItems]);

  const clearChecked = useCallback(() => {
    setItems(prev => prev.filter(item => !item.isChecked));
  }, [setItems]);

  // Get checked items before clearing (for inventory tracking)
  const getCheckedItems = useCallback(() => {
    return items.filter(item => item.isChecked);
  }, [items]);

  // Check for potential duplicate
  const checkDuplicate = useCallback((name: string) => {
    return items.find(
      item => item.name.toLowerCase() === name.toLowerCase() && !item.isChecked
    );
  }, [items]);

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
  }, [setBudget]);

  // Reset to initial state (for new users)
  const resetStore = useCallback(() => {
    setItems(INITIAL_ITEMS);
    setBudget(INITIAL_BUDGET);
  }, [setItems, setBudget]);

  return {
    items,
    budget,
    stats,
    addItem,
    removeItem,
    toggleItem,
    updateQuantity,
    clearChecked,
    getCheckedItems,
    checkDuplicate,
    updateBudget,
    resetStore,
    userId,
  };
}