import { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Bell, User, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OfflineIndicator } from './OfflineIndicator';
import { ProductImage } from './ProductImage';
import { formatPrice } from '@/lib/currency';
import { getProductImage } from '@/lib/productImages';

interface SearchResult {
  name: string;
  category: string;
  price: number;
  store: string;
  type: 'suggestion';
}

// Popular Indian grocery search suggestions
const popularSearches: SearchResult[] = [
  { name: 'Tata Salt 1kg', category: 'Pantry', price: 28, store: 'BigBasket', type: 'suggestion' },
  { name: 'Amul Butter 500g', category: 'Dairy & Eggs', price: 275, store: 'Zepto', type: 'suggestion' },
  { name: 'Aashirvaad Atta 5kg', category: 'Grains', price: 295, store: 'BigBasket', type: 'suggestion' },
  { name: 'Fresh Tomatoes 1kg', category: 'Fruits & Vegetables', price: 40, store: 'Blinkit', type: 'suggestion' },
  { name: 'Mother Dairy Milk 1L', category: 'Dairy & Eggs', price: 68, store: 'Zepto', type: 'suggestion' },
  { name: 'Toor Dal 1kg', category: 'Grains', price: 165, store: 'DMart', type: 'suggestion' },
  { name: 'Maggi Noodles Pack', category: 'Pantry', price: 168, store: 'Amazon Fresh', type: 'suggestion' },
  { name: 'Fortune Oil 1L', category: 'Pantry', price: 145, store: 'JioMart', type: 'suggestion' },
  { name: 'Onions 1kg', category: 'Fruits & Vegetables', price: 35, store: 'BigBasket', type: 'suggestion' },
  { name: 'Eggs 12 pcs', category: 'Dairy & Eggs', price: 84, store: 'Blinkit', type: 'suggestion' },
  { name: 'Chicken Breast 500g', category: 'Meat & Seafood', price: 220, store: 'BigBasket', type: 'suggestion' },
  { name: 'Basmati Rice 5kg', category: 'Grains', price: 450, store: 'DMart', type: 'suggestion' },
  { name: 'Paneer 200g', category: 'Dairy & Eggs', price: 90, store: 'Zepto', type: 'suggestion' },
  { name: 'Curd 400g', category: 'Dairy & Eggs', price: 35, store: 'Blinkit', type: 'suggestion' },
  { name: 'Green Chillies 100g', category: 'Fruits & Vegetables', price: 10, store: 'BigBasket', type: 'suggestion' },
];

interface HeaderProps {
  notificationCount?: number;
  isOnline?: boolean;
  onUserClick?: () => void;
  onNotificationClick?: () => void;
  onAddItem?: (item: { name: string; category: string; price: number; store: string; quantity: number; unit: string; isHealthy: boolean; hasDeal: boolean }) => void;
  onSearch?: (query: string) => void;
}

export function Header({ 
  notificationCount = 0, 
  isOnline = true, 
  onUserClick,
  onNotificationClick,
  onAddItem,
  onSearch,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const results = popularSearches.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.store.toLowerCase().includes(q)
      );
      setFilteredResults(results);
      setShowResults(true);
    } else {
      setFilteredResults(popularSearches.slice(0, 6));
      setShowResults(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddFromSearch = (result: SearchResult) => {
    onAddItem?.({
      name: result.name,
      category: result.category,
      price: result.price,
      store: result.store,
      quantity: 1,
      unit: 'pcs',
      isHealthy: ['Fruits & Vegetables', 'Dairy & Eggs'].includes(result.category),
      hasDeal: false,
    });
    setSearchQuery('');
    setShowResults(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch?.(searchQuery.trim());
      setShowResults(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Prime Mart</h1>
            <p className="text-xs text-muted-foreground">Shop Smarter</p>
          </div>
        </div>

        <div className="hidden flex-1 max-w-md mx-8 md:block" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search groceries... (e.g. atta, paneer, fruits)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              className="w-full h-10 pl-10 pr-10 rounded-xl bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setShowResults(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}

            {/* Search Dropdown */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto">
                {filteredResults.length > 0 ? (
                  <>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                      {searchQuery ? 'Search Results' : 'Popular Products'}
                    </div>
                    {filteredResults.map((result, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddFromSearch(result)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/50 transition-colors text-left"
                      >
                        <ProductImage name={result.name} category={result.category} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{result.name}</p>
                          <p className="text-xs text-muted-foreground">{result.store} • {result.category}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">{formatPrice(result.price)}</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No products found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center gap-2">
          <OfflineIndicator isOnline={isOnline} />
          <Button variant="ghost" size="icon" className="relative" onClick={onNotificationClick}>
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge variant="deal" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {notificationCount}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={onUserClick}>
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
