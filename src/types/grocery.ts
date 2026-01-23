export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  isHealthy: boolean;
  hasDeal: boolean;
  dealPrice?: number;
  expiryDays?: number;
  store: string;
  image?: string;
  isChecked: boolean;
  addedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Store {
  id: string;
  name: string;
  logo?: string;
}

export interface Budget {
  total: number;
  spent: number;
  remaining: number;
}

export interface SmartSuggestion {
  id: string;
  item: GroceryItem;
  reason: string;
  type: 'history' | 'deal' | 'healthy' | 'budget';
}

// User Profile types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  favoriteStores: string[];
  favoriteBrands: string[];
  createdAt: Date;
}

// Inventory tracking types
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  lastPurchased?: Date;
  averageConsumption?: number; // per week
}

export interface LowStockAlert {
  itemId: string;
  itemName: string;
  currentStock: number;
  minStock: number;
  unit: string;
}

export interface PurchaseHistory {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
  store: string;
  purchasedAt: Date;
}
