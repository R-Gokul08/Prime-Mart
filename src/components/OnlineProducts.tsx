import { useState, useEffect } from 'react';
import { ShoppingBag, ExternalLink, RefreshCw, Search, Tag, Store, Star, ShoppingCart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/currency';

interface OnlineProduct {
  name: string;
  price: number;
  category: string;
  store: string;
  image?: string;
  dealPrice?: number;
  hasDeal: boolean;
  rating?: number;
  unit?: string;
  description?: string;
}

interface OnlineProductsProps {
  onAddItem: (item: {
    name: string;
    category: string;
    price: number;
    store: string;
    hasDeal: boolean;
    dealPrice?: number;
    quantity: number;
    unit: string;
    isHealthy: boolean;
  }) => void;
}

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'fruits', label: '🍎 Fruits' },
  { value: 'vegetables', label: '🥬 Vegetables' },
  { value: 'dairy', label: '🥛 Dairy & Eggs' },
  { value: 'meat', label: '🥩 Meat & Poultry' },
  { value: 'seafood', label: '🐟 Seafood' },
  { value: 'grains', label: '🌾 Grains & Pulses' },
  { value: 'spices', label: '🌶️ Spices & Masala' },
  { value: 'snacks', label: '🍿 Snacks' },
  { value: 'beverages', label: '🥤 Beverages' },
];

const indianStores = [
  { value: 'all', label: 'All Stores', color: 'bg-muted' },
  { value: 'bigbasket', label: 'BigBasket', color: 'bg-green-600' },
  { value: 'jiomart', label: 'JioMart', color: 'bg-blue-600' },
  { value: 'amazon', label: 'Amazon Fresh', color: 'bg-orange-500' },
  { value: 'zepto', label: 'Zepto', color: 'bg-purple-600' },
  { value: 'blinkit', label: 'Blinkit', color: 'bg-yellow-500' },
  { value: 'dmart', label: 'DMart', color: 'bg-red-600' },
];

export function OnlineProducts({ onAddItem }: OnlineProductsProps) {
  const [products, setProducts] = useState<OnlineProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchProducts = async (query?: string, category?: string) => {
    setIsLoading(true);
    try {
      const searchTerm = query || (category && category !== 'all' ? category : 'grocery products India');
      
      const { data, error } = await supabase.functions.invoke('scrape-grocery-products', {
        body: { 
          searchQuery: searchTerm,
          category: category !== 'all' ? category : undefined,
        },
      });

      if (error) throw error;

      if (data?.success && data?.products) {
        setProducts(data.products);
        setLastUpdated(data.updatedAt);
        toast.success(`Found ${data.products.length} products from online stores`);
      } else {
        toast.error(data?.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to connect to online stores. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchProducts(searchQuery, selectedCategory);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category !== 'all') {
      fetchProducts(searchQuery || category, category);
    }
  };

  const handleAddProduct = (product: OnlineProduct) => {
    onAddItem({
      name: product.name,
      category: product.category || 'General',
      price: product.hasDeal && product.dealPrice ? product.dealPrice : product.price,
      store: product.store,
      hasDeal: product.hasDeal,
      dealPrice: product.dealPrice,
      quantity: 1,
      unit: product.unit || 'pcs',
      isHealthy: ['fruits', 'vegetables', 'dairy'].some(c => product.category?.toLowerCase().includes(c)),
    });
    toast.success(`${product.name} added to your list!`);
  };

  const getStoreColor = (store: string) => {
    const lowerStore = store.toLowerCase();
    if (lowerStore.includes('bigbasket')) return 'bg-green-600';
    if (lowerStore.includes('jiomart')) return 'bg-blue-600';
    if (lowerStore.includes('amazon')) return 'bg-orange-500';
    if (lowerStore.includes('zepto')) return 'bg-purple-600';
    if (lowerStore.includes('blinkit')) return 'bg-yellow-500';
    if (lowerStore.includes('dmart')) return 'bg-red-600';
    if (lowerStore.includes('flipkart')) return 'bg-blue-500';
    return 'bg-muted';
  };

  const filteredProducts = products.filter(product => {
    if (selectedStore !== 'all') {
      return product.store.toLowerCase().includes(selectedStore);
    }
    return true;
  });

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Online Store Products
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchProducts(searchQuery, selectedCategory)}
            disabled={isLoading}
            className="gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {lastUpdated && (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products (e.g., atta, paneer, mangoes)"
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            Search
          </Button>
        </form>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Store" />
            </SelectTrigger>
            <SelectContent>
              {indianStores.map((store) => (
                <SelectItem key={store.value} value={store.value}>
                  {store.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filteredProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="h-16 w-16 rounded-lg object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-medium text-sm line-clamp-2" title={product.name}>
                    {product.name}
                  </p>
                  
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className={`text-xs text-white ${getStoreColor(product.store)}`}
                    >
                      <Store className="h-3 w-3 mr-1" />
                      {product.store}
                    </Badge>
                    
                    {product.category && (
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    )}
                    
                    {product.hasDeal && (
                      <Badge variant="success" className="text-xs gap-1">
                        <Tag className="h-3 w-3" />
                        Deal
                      </Badge>
                    )}
                    
                    {product.rating && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {product.rating}
                      </div>
                    )}
                  </div>
                  
                  {product.unit && (
                    <p className="text-xs text-muted-foreground">
                      {product.unit}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  {product.hasDeal && product.dealPrice ? (
                    <div>
                      <p className="text-xs line-through text-muted-foreground">
                        {formatPrice(product.price)}
                      </p>
                      <p className="font-bold text-success">
                        {formatPrice(product.dealPrice)}
                      </p>
                      <p className="text-xs text-success">
                        {Math.round((1 - product.dealPrice / product.price) * 100)}% off
                      </p>
                    </div>
                  ) : (
                    <p className="font-bold">{formatPrice(product.price)}</p>
                  )}
                  
                  <Button 
                    size="sm" 
                    onClick={() => handleAddProduct(product)}
                    className="mt-2 gap-1"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Search for products from online grocery stores</p>
            <p className="text-xs mt-1">BigBasket, JioMart, Amazon Fresh, Zepto & more</p>
            <div className="flex gap-2 justify-center mt-4 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => fetchProducts('fruits')}>
                🍎 Fruits
              </Button>
              <Button variant="outline" size="sm" onClick={() => fetchProducts('vegetables')}>
                🥬 Vegetables
              </Button>
              <Button variant="outline" size="sm" onClick={() => fetchProducts('dairy milk')}>
                🥛 Dairy
              </Button>
              <Button variant="outline" size="sm" onClick={() => fetchProducts('rice atta')}>
                🌾 Grains
              </Button>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Prices in ₹ • Live data from major Indian grocery retailers
        </p>
      </CardContent>
    </Card>
  );
}
