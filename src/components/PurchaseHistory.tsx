import { format } from 'date-fns';
import { Receipt, TrendingUp, Calendar, Store } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProductImage } from '@/components/ProductImage';
import { PurchaseHistory as PurchaseHistoryType } from '@/types/grocery';

interface PurchaseHistoryProps {
  purchases: PurchaseHistoryType[];
}

export function PurchaseHistoryCard({ purchases }: PurchaseHistoryProps) {
  const recentPurchases = purchases.slice(0, 10);
  const totalSpent = purchases.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const thisMonthPurchases = purchases.filter(p => {
    const purchaseDate = new Date(p.purchasedAt);
    const now = new Date();
    return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
  });
  const thisMonthSpent = thisMonthPurchases.reduce((sum, p) => sum + p.price * p.quantity, 0);

  if (purchases.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Purchase History</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No purchase history yet</p>
          <p className="text-xs">Complete your first shopping to see history</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Purchase History</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          ${thisMonthSpent.toFixed(2)} this month
        </Badge>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-2 pr-2">
          {recentPurchases.map((purchase) => (
            <div 
              key={purchase.id} 
              className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <ProductImage name={purchase.itemName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{purchase.itemName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Store className="h-3 w-3" />
                    {purchase.store}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(purchase.purchasedAt), 'MMM d')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">${(purchase.price * purchase.quantity).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">×{purchase.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-4 pt-3 border-t">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total spent (all time)</span>
          <span className="font-bold text-lg">${totalSpent.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}
