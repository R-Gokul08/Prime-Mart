import { useState, useEffect } from 'react';
import { Package, CheckCircle2, Truck, Home, Clock, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus } from '@/types/grocery';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface OrderTrackingProps {
  order: Order;
  onClose: () => void;
}

const statusSteps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'confirmed', label: 'Order Confirmed', icon: <CheckCircle2 className="h-5 w-5" /> },
  { status: 'preparing', label: 'Preparing', icon: <Package className="h-5 w-5" /> },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck className="h-5 w-5" /> },
  { status: 'delivered', label: 'Delivered', icon: <Home className="h-5 w-5" /> },
];

const getStatusProgress = (status: OrderStatus): number => {
  switch (status) {
    case 'confirmed': return 25;
    case 'preparing': return 50;
    case 'out_for_delivery': return 75;
    case 'delivered': return 100;
    default: return 0;
  }
};

const getStatusIndex = (status: OrderStatus): number => {
  return statusSteps.findIndex(s => s.status === status);
};

export function OrderTracking({ order, onClose }: OrderTrackingProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const statusIndex = getStatusIndex(currentStatus);
  const progress = getStatusProgress(currentStatus);

  // Simulate order status updates
  useEffect(() => {
    if (currentStatus === 'delivered') return;

    const statusOrder: OrderStatus[] = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    
    const timer = setTimeout(() => {
      if (currentIndex < statusOrder.length - 1) {
        setCurrentStatus(statusOrder[currentIndex + 1]);
      }
    }, 5000); // Update every 5 seconds for demo

    return () => clearTimeout(timer);
  }, [currentStatus]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-primary" />
            Order #{order.id.slice(0, 8).toUpperCase()}
          </CardTitle>
          <Badge variant={currentStatus === 'delivered' ? 'default' : 'secondary'}>
            {statusSteps[statusIndex].label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <Clock className="h-4 w-4" />
          <span>Estimated: {format(order.estimatedDelivery, 'h:mm a, MMM d')}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Progress Bar */}
        <div className="space-y-3">
          <Progress value={progress} className="h-2" />
          
          {/* Status Steps */}
          <div className="grid grid-cols-4 gap-2">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= statusIndex;
              const isCurrent = index === statusIndex;
              
              return (
                <div 
                  key={step.status}
                  className={cn(
                    "flex flex-col items-center text-center gap-1",
                    isCompleted ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isCompleted 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted",
                    isCurrent && "ring-2 ring-primary ring-offset-2"
                  )}>
                    {step.icon}
                  </div>
                  <span className="text-xs font-medium">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="p-4 rounded-xl bg-muted/50 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Delivery Address</p>
              <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{order.items.length} items</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          {order.savings > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Savings</span>
              <span>-${order.savings.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold pt-2 border-t">
            <span>Total Paid</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          {currentStatus === 'delivered' ? 'Done' : 'Continue Shopping'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function OrderTrackingBadge({ 
  order, 
  onClick 
}: { 
  order: Order; 
  onClick: () => void;
}) {
  const statusIndex = getStatusIndex(order.status);
  const progress = getStatusProgress(order.status);
  
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all text-left"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">Order in progress</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {statusSteps[statusIndex].label}
        </Badge>
      </div>
      <Progress value={progress} className="h-1.5" />
      <p className="text-xs text-muted-foreground mt-1.5">
        Tap to track • ETA: {format(order.estimatedDelivery, 'h:mm a')}
      </p>
    </button>
  );
}