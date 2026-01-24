import { Bell, Package, Truck, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Order, LowStockAlert } from '@/types/grocery';
import { formatPrice } from '@/lib/currency';

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeOrder?: Order | null;
  lowStockAlerts: LowStockAlert[];
}

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'confirmed':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'preparing':
      return <Package className="h-4 w-4 text-warning" />;
    case 'out_for_delivery':
      return <Truck className="h-4 w-4 text-primary" />;
    case 'delivered':
      return <CheckCircle className="h-4 w-4 text-success" />;
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusText = (status: Order['status']) => {
  switch (status) {
    case 'confirmed':
      return 'Order Confirmed';
    case 'preparing':
      return 'Preparing Your Order';
    case 'out_for_delivery':
      return 'Out for Delivery';
    case 'delivered':
      return 'Delivered';
    default:
      return 'Processing';
  }
};

export function NotificationsPanel({ 
  open, 
  onOpenChange, 
  activeOrder,
  lowStockAlerts 
}: NotificationsPanelProps) {
  const hasNotifications = activeOrder || lowStockAlerts.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {!hasNotifications ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs mt-1">Your order updates will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Order Notification */}
              {activeOrder && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Active Order
                  </h3>
                  <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(activeOrder.status)}
                        <div>
                          <p className="font-medium text-sm">
                            {getStatusText(activeOrder.status)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Order #{activeOrder.id.slice(0, 8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activeOrder.items.length} items
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-semibold">{formatPrice(activeOrder.total)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Payment</span>
                        <span className="capitalize">{activeOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expected Delivery</span>
                        <span>{new Date(activeOrder.estimatedDelivery).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Items:</p>
                      {activeOrder.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="truncate max-w-[200px]">{item.name}</span>
                          <span>{item.quantity}x</span>
                        </div>
                      ))}
                      {activeOrder.items.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{activeOrder.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Low Stock Alerts */}
              {lowStockAlerts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Low Stock Alerts
                  </h3>
                  {lowStockAlerts.map((alert) => (
                    <div 
                      key={alert.itemId}
                      className="p-3 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-3"
                    >
                      <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{alert.itemName}</p>
                        <p className="text-xs text-muted-foreground">
                          Only {alert.currentStock} {alert.unit} left (min: {alert.minStock})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Activity */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Recent Activity
                </h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-secondary/30 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Welcome to Prime Mart!</p>
                      <p className="text-xs text-muted-foreground">
                        Start adding items to your grocery list
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
