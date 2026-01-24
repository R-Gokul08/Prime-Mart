import { BarChart3, MapPin, TrendingDown, Store } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/currency';

interface PriceComparisonProps {
  itemName?: string;
}

// Mock price data for Indian stores
const mockPrices = [
  { store: 'BigBasket', price: 45, distance: '2 km', isBest: false },
  { store: 'JioMart', price: 42, distance: '3.5 km', isBest: true },
  { store: 'Amazon Fresh', price: 48, distance: '—', isBest: false },
  { store: 'Zepto', price: 46, distance: '1 km', isBest: false },
  { store: 'Blinkit', price: 47, distance: '1.5 km', isBest: false },
  { store: 'DMart', price: 40, distance: '5 km', isBest: false },
];

export function PriceComparison({ itemName = "Amul Butter 500g" }: PriceComparisonProps) {
  const sortedPrices = [...mockPrices].sort((a, b) => a.price - b.price);
  const bestPrice = sortedPrices[0].price;
  const worstPrice = sortedPrices[sortedPrices.length - 1].price;

  // Update best flag based on sorting
  sortedPrices.forEach((item, index) => {
    item.isBest = index === 0;
  });

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Price Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Comparing prices for <span className="font-medium text-foreground">{itemName}</span>
        </p>
        
        <div className="space-y-2">
          {sortedPrices.map((item, index) => {
            const savingsPercent = ((worstPrice - item.price) / worstPrice * 100).toFixed(0);
            
            return (
              <div
                key={item.store}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  item.isBest ? 'bg-success/10 border border-success/30' : 'bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.store}</span>
                      {item.isBest && (
                        <Badge variant="success" className="text-xs">
                          Best Price
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {item.distance}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${item.isBest ? 'text-success' : ''}`}>
                    {formatPrice(item.price)}
                  </p>
                  {item.price < worstPrice && (
                    <p className="text-xs text-success flex items-center gap-1 justify-end">
                      <TrendingDown className="h-3 w-3" />
                      Save {savingsPercent}%
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Prices updated today • Connect store apps for live pricing
        </p>
      </CardContent>
    </Card>
  );
}
