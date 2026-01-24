import { GroceryItem, Category, Store, SmartSuggestion } from '@/types/grocery';

export const categories: Category[] = [
  { id: '1', name: 'Fruits & Vegetables', icon: '🥬', color: 'bg-green-100' },
  { id: '2', name: 'Dairy & Eggs', icon: '🥛', color: 'bg-blue-100' },
  { id: '3', name: 'Meat & Seafood', icon: '🥩', color: 'bg-red-100' },
  { id: '4', name: 'Bakery', icon: '🍞', color: 'bg-amber-100' },
  { id: '5', name: 'Pantry', icon: '🥫', color: 'bg-orange-100' },
  { id: '6', name: 'Frozen', icon: '🧊', color: 'bg-cyan-100' },
  { id: '7', name: 'Beverages', icon: '🧃', color: 'bg-purple-100' },
  { id: '8', name: 'Snacks', icon: '🍿', color: 'bg-yellow-100' },
];

export const stores: Store[] = [
  { id: '1', name: 'BigBasket' },
  { id: '2', name: 'JioMart' },
  { id: '3', name: 'Amazon Fresh' },
  { id: '4', name: 'Zepto' },
  { id: '5', name: 'Blinkit' },
  { id: '6', name: 'DMart' },
];

// Empty initial items - users build their own list
export const sampleGroceryItems: GroceryItem[] = [];

export const smartSuggestions: SmartSuggestion[] = [
  {
    id: '1',
    item: {
      id: 'sug-1',
      name: 'Fresh Tomatoes',
      category: 'Fruits & Vegetables',
      quantity: 1,
      unit: 'kg',
      price: 50,
      isHealthy: true,
      hasDeal: true,
      dealPrice: 35,
      store: 'BigBasket',
      isChecked: false,
      addedAt: new Date(),
    },
    reason: 'You bought this last week',
    type: 'history',
  },
  {
    id: '2',
    item: {
      id: 'sug-2',
      name: 'Fresh Spinach (Palak)',
      category: 'Fruits & Vegetables',
      quantity: 1,
      unit: 'bunch',
      price: 30,
      isHealthy: true,
      hasDeal: false,
      store: 'Zepto',
      isChecked: false,
      addedAt: new Date(),
    },
    reason: 'Rich in iron & vitamins',
    type: 'healthy',
  },
  {
    id: '3',
    item: {
      id: 'sug-3',
      name: 'Fortune Sunflower Oil',
      category: 'Pantry',
      quantity: 1,
      unit: 'ltr',
      price: 150,
      isHealthy: true,
      hasDeal: true,
      dealPrice: 120,
      store: 'JioMart',
      isChecked: false,
      addedAt: new Date(),
    },
    reason: '20% off this week!',
    type: 'deal',
  },
  {
    id: '4',
    item: {
      id: 'sug-4',
      name: 'Toor Dal',
      category: 'Pantry',
      quantity: 1,
      unit: 'kg',
      price: 150,
      isHealthy: true,
      hasDeal: false,
      store: 'DMart',
      isChecked: false,
      addedAt: new Date(),
    },
    reason: 'Budget-friendly protein',
    type: 'budget',
  },
];

export const expiringItems = [
  { name: 'Milk', daysLeft: 2, icon: '🥛' },
  { name: 'Coriander', daysLeft: 3, icon: '🌿' },
  { name: 'Chicken', daysLeft: 1, icon: '🍗' },
];
