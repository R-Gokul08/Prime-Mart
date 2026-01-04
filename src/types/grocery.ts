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
