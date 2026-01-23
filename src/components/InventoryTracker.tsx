import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, AlertTriangle, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { InventoryItem, LowStockAlert } from '@/types/grocery';

interface InventoryTrackerProps {
  inventory: InventoryItem[];
  lowStockAlerts: LowStockAlert[];
  onUseItem: (itemId: string, quantity?: number) => void;
  onUpdateMinStock: (itemId: string, minStock: number) => void;
  onRemoveItem: (itemId: string) => void;
  onAddToShoppingList?: (item: InventoryItem) => void;
}

export function InventoryTracker({
  inventory,
  lowStockAlerts,
  onUseItem,
  onRemoveItem,
  onAddToShoppingList,
}: InventoryTrackerProps) {
  const getStockPercentage = (current: number, min: number) => {
    const max = min * 3; // Consider "full" as 3x the minimum
    return Math.min(100, (current / max) * 100);
  };

  const getStockColor = (current: number, min: number) => {
    if (current <= min) return 'bg-destructive';
    if (current <= min * 1.5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Card className="border-0 shadow-lg bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-full bg-primary/10">
            <Package className="h-4 w-4 text-primary" />
          </div>
          Smart Inventory
          {lowStockAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {lowStockAlerts.length} Low
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Low Stock Alerts */}
        {lowStockAlerts.length > 0 && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
              <AlertTriangle className="h-4 w-4" />
              Running Low
            </div>
            <div className="space-y-1">
              {lowStockAlerts.map((alert) => (
                <div key={alert.itemId} className="flex items-center justify-between text-sm">
                  <span>{alert.itemName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {alert.currentStock} {alert.unit}
                    </span>
                    {onAddToShoppingList && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2"
                        onClick={() => {
                          const item = inventory.find(i => i.id === alert.itemId);
                          if (item) onAddToShoppingList(item);
                        }}
                      >
                        <ShoppingCart className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory List */}
        <ScrollArea className="h-[200px]">
          {inventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No items in inventory yet</p>
              <p className="text-xs">Items will appear here after purchase</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inventory.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{item.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress
                      value={getStockPercentage(item.currentStock, item.minStock)}
                      className={`h-2 flex-1 [&>div]:${getStockColor(item.currentStock, item.minStock)}`}
                    />
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Min: {item.minStock} {item.unit}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => onUseItem(item.id)}
                        disabled={item.currentStock === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.currentStock}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => onUseItem(item.id, -1)} // Negative to add
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
