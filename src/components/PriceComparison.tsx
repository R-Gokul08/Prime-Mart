import { useState, useEffect } from 'react';
import { BarChart3, MapPin, TrendingDown, Store, Loader2, Search, Clock, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductImage } from './ProductImage';

interface StorePrice {
  store: string;
  price: number;
  originalPrice?: number | null;
  distance: string;
  deliveryTime: string;
  inStock: boolean;
  rating: number;
}

interface PriceComparisonProps {
  itemName?: string;
}

const popularProducts = [
  'Tata Salt 1kg', 'Amul Butter 500g', 'Aashirvaad Atta 5kg', 
  'Fortune Sunflower Oil 1L', 'Toor Dal 1kg', 'Basmati Rice 5kg',
  'Mother Dairy Milk 1L', 'Maggi Noodles', 'Fresh Paneer 200g',
];

export function PriceComparison({ itemName = "Amul Butter 500g" }: PriceComparisonProps) {
  const [prices, setPrices] = useState<StorePrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(itemName);
  const [currentProduct, setCurrentProduct] = useState(itemName);

  const fetchPrices = async (productName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('price-comparison', {
        body: { productName },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.success && data?.prices) {
        setPrices(data.prices);
        setCurrentProduct(productName);
      }
    } catch (error) {
      console.error('Price comparison error:', error);
      toast.error('Failed to fetch prices. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices(itemName);
  }, [itemName]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchPrices(searchQuery.trim());
    }
  };

  const sortedPrices = [...prices]
    .filter(p => p.inStock !== false)
    .sort((a, b) => a.price - b.price);

  const bestPrice = sortedPrices[0]?.price || 0;
  const worstPrice = sortedPrices[sortedPrices.length - 1]?.price || 0;

  const getStoreEmoji = (store: string) => {
    const s = store.toLowerCase();
    if (s.includes('bigbasket')) return '🛒';
    if (s.includes('jiomart')) return '🏪';
    if (s.includes('amazon')) return '📦';
    if (s.includes('zepto')) return '⚡';
    if (s.includes('blinkit')) return '🛵';
    if (s.includes('dmart')) return '🏬';
    if (s.includes('swiggy')) return '🍔';
    if (s.includes('flipkart')) return '📱';
    return '🏪';
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Price Comparison
            <Badge variant="secondary" className="text-xs">Live</Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => fetchPrices(currentProduct)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Compare prices for..."
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button type="submit" size="sm" disabled={isLoading}>
            Compare
          </Button>
        </form>

        {/* Quick product chips */}
        <div className="flex gap-1.5 flex-wrap">
          {popularProducts.slice(0, 4).map((p) => (
            <Button
              key={p}
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => { setSearchQuery(p); fetchPrices(p); }}
              disabled={isLoading}
            >
              {p}
            </Button>
          ))}
        </div>

        {/* Current product */}
        <div className="flex items-center gap-2">
          <ProductImage name={currentProduct} size="sm" />
          <p className="text-sm text-muted-foreground">
            Comparing <span className="font-medium text-foreground">{currentProduct}</span>
          </p>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Fetching live prices...</span>
          </div>
        ) : sortedPrices.length > 0 ? (
          <div className="space-y-2">
            {sortedPrices.map((item, index) => {
              const isBest = index === 0;
              const savingsPercent = worstPrice > 0 ? ((worstPrice - item.price) / worstPrice * 100).toFixed(0) : '0';

              return (
                <div
                  key={item.store}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                    isBest ? 'bg-green-500/10 border border-green-500/30' : 'bg-secondary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{getStoreEmoji(item.store)}</span>
                        <span className="font-medium text-sm">{item.store}</span>
                        {isBest && (
                          <Badge className="text-xs bg-green-600 hover:bg-green-700">
                            Best Price
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.deliveryTime}
                        </span>
                        {item.rating > 0 && (
                          <span>⭐ {item.rating}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.originalPrice && item.originalPrice > item.price ? (
                      <>
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.originalPrice)}
                        </p>
                        <p className={`text-lg font-bold ${isBest ? 'text-green-600' : ''}`}>
                          {formatPrice(item.price)}
                        </p>
                      </>
                    ) : (
                      <p className={`text-lg font-bold ${isBest ? 'text-green-600' : ''}`}>
                        {formatPrice(item.price)}
                      </p>
                    )}
                    {item.price < worstPrice && (
                      <p className="text-xs text-green-600 flex items-center gap-1 justify-end">
                        <TrendingDown className="h-3 w-3" />
                        Save {savingsPercent}%
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            Search for a product to compare prices across stores
          </p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Prices from BigBasket, JioMart, Amazon Fresh, Zepto, Blinkit & more
        </p>
      </CardContent>
    </Card>
  );
}
