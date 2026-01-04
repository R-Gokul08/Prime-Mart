import { BarChart3, MapPin, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { stores } from '@/data/mockData';

interface PriceComparisonProps {
  itemName?: string;
}

// Mock price data
const mockPrices = [
  { store: 'FreshMart', price: 2.99, distance: '0.5 mi', isBest: false },
  { store: 'SuperSave', price: 2.49, distance: '1.2 mi', isBest: true },
  { store: 'GreenGrocer', price: 3.29, distance: '0.8 mi', isBest: false },
  { store: 'MegaMart', price: 2.79, distance: '2.1 mi', isBest: false },
];

export function PriceComparison({ itemName = "Organic Bananas" }: PriceComparisonProps) {
  const bestPrice = Math.min(...mockPrices.map(p => p.price));
  const worstPrice = Math.max(...mockPrices.map(p => p.price));

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
          {mockPrices.sort((a, b) => a.price - b.price).map((item, index) => {
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
                    ${item.price.toFixed(2)}
                  </p>
                  {item.price < worstPrice && (
                    <p className="text-xs text-success">
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
