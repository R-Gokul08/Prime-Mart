import { useCallback, useMemo } from 'react';
import { InventoryItem, LowStockAlert, PurchaseHistory, GroceryItem } from '@/types/grocery';
import { useLocalStorage } from './useLocalStorage';

export function useInventory() {
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('smartcart-inventory', []);
  const [purchaseHistory, setPurchaseHistory] = useLocalStorage<PurchaseHistory[]>('smartcart-purchases', []);

  // Get low stock alerts
  const lowStockAlerts = useMemo<LowStockAlert[]>(() => {
    return inventory
      .filter(item => item.currentStock <= item.minStock)
      .map(item => ({
        itemId: item.id,
        itemName: item.name,
        currentStock: item.currentStock,
        minStock: item.minStock,
        unit: item.unit,
      }));
  }, [inventory]);

  // Check for duplicate items
  const checkDuplicate = useCallback((itemName: string): InventoryItem | undefined => {
    return inventory.find(
      item => item.name.toLowerCase() === itemName.toLowerCase()
    );
  }, [inventory]);

  // Add item to inventory
  const addToInventory = useCallback((item: Omit<InventoryItem, 'id'>) => {
    const existing = checkDuplicate(item.name);
    if (existing) {
      // Update existing item's stock
      setInventory(prev =>
        prev.map(i =>
          i.id === existing.id
            ? { ...i, currentStock: i.currentStock + item.currentStock, lastPurchased: new Date() }
            : i
        )
      );
    } else {
      setInventory(prev => [
        ...prev,
        { ...item, id: crypto.randomUUID() },
      ]);
    }
  }, [checkDuplicate, setInventory]);

  // Update stock after purchase (from checked items)
  const recordPurchase = useCallback((item: GroceryItem) => {
    const purchase: PurchaseHistory = {
      id: crypto.randomUUID(),
      itemName: item.name,
      quantity: item.quantity,
      price: item.hasDeal && item.dealPrice ? item.dealPrice : item.price,
      store: item.store,
      purchasedAt: new Date(),
    };
    setPurchaseHistory(prev => [purchase, ...prev].slice(0, 100)); // Keep last 100 purchases

    // Update or add to inventory
    const existing = inventory.find(
      i => i.name.toLowerCase() === item.name.toLowerCase()
    );

    if (existing) {
      setInventory(prev =>
        prev.map(i =>
          i.id === existing.id
            ? { ...i, currentStock: i.currentStock + item.quantity, lastPurchased: new Date() }
            : i
        )
      );
    } else {
      setInventory(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: item.name,
          category: item.category,
          currentStock: item.quantity,
          minStock: 1,
          unit: item.unit,
          lastPurchased: new Date(),
        },
      ]);
    }
  }, [inventory, setInventory, setPurchaseHistory]);

  // Use item from inventory (reduce stock)
  const useFromInventory = useCallback((itemId: string, quantity: number = 1) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, currentStock: Math.max(0, item.currentStock - quantity) }
          : item
      )
    );
  }, [setInventory]);

  // Update minimum stock threshold
  const updateMinStock = useCallback((itemId: string, minStock: number) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, minStock }
          : item
      )
    );
  }, [setInventory]);

  // Remove item from inventory
  const removeFromInventory = useCallback((itemId: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId));
  }, [setInventory]);

  // Get recent purchases
  const recentPurchases = useMemo(() => {
    return purchaseHistory.slice(0, 10);
  }, [purchaseHistory]);

  return {
    inventory,
    purchaseHistory,
    lowStockAlerts,
    recentPurchases,
    checkDuplicate,
    addToInventory,
    recordPurchase,
    useFromInventory,
    updateMinStock,
    removeFromInventory,
  };
}
