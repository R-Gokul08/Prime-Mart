import { useState, useEffect } from 'react';
import { ShoppingBag, ExternalLink, RefreshCw, Search, Tag, Store } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OnlineProduct {
  name: string;
  price: number;
  category: string;
  store: string;
  image?: string;
  dealPrice?: number;
  hasDeal: boolean;
}

interface OnlineProductsProps {
  onAddItem: (item: {
    name: string;
    category: string;
    price: number;
    store: string;
    hasDeal: boolean;
    dealPrice?: number;
  }) => void;
}

export function OnlineProducts({ onAddItem }: OnlineProductsProps) {
  const [products, setProducts] = useState<OnlineProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchProducts = async (query?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('scrape-grocery-products', {
        body: { searchQuery: query || 'fresh groceries' },
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
      fetchProducts(searchQuery);
    }
  };

  const handleAddProduct = (product: OnlineProduct) => {
    onAddItem({
      name: product.name,
      category: product.category,
      price: product.hasDeal && product.dealPrice ? product.dealPrice : product.price,
      store: product.store,
      hasDeal: product.hasDeal,
      dealPrice: product.dealPrice,
    });
    toast.success(`${product.name} added to your list!`);
  };

  const getStoreColor = (store: string) => {
    switch (store.toLowerCase()) {
      case 'amazon': return 'bg-orange-500';
      case 'walmart': return 'bg-blue-600';
      case 'target': return 'bg-red-600';
      case 'instacart': return 'bg-green-600';
      default: return 'bg-muted';
    }
  };

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
            onClick={() => fetchProducts()}
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
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products (e.g., organic milk, fruits)"
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            Search
          </Button>
        </form>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {products.map((product, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" title={product.name}>
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant="outline" 
                      className={`text-xs text-white ${getStoreColor(product.store)}`}
                    >
                      <Store className="h-3 w-3 mr-1" />
                      {product.store}
                    </Badge>
                    {product.hasDeal && (
                      <Badge variant="success" className="text-xs gap-1">
                        <Tag className="h-3 w-3" />
                        Deal
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {product.hasDeal && product.dealPrice ? (
                    <div>
                      <p className="text-sm line-through text-muted-foreground">
                        ${product.price.toFixed(2)}
                      </p>
                      <p className="font-bold text-success">
                        ${product.dealPrice.toFixed(2)}
                      </p>
                    </div>
                  ) : (
                    <p className="font-bold">${product.price.toFixed(2)}</p>
                  )}
                </div>

                <Button 
                  size="sm" 
                  onClick={() => handleAddProduct(product)}
                  className="shrink-0"
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Search for products from online grocery stores</p>
            <p className="text-xs mt-1">Amazon, Walmart, Target, Instacart & more</p>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Powered by live product data from major grocery retailers
        </p>
      </CardContent>
    </Card>
  );
}
