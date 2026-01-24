import { useState } from 'react';
import { ShoppingCart, CreditCard, CheckCircle2, Package, Sparkles, Truck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductImage } from '@/components/ProductImage';
import { PaymentMethods } from '@/components/PaymentMethods';
import { OrderTracking } from '@/components/OrderTracking';
import { GroceryItem, PaymentMethod, Order } from '@/types/grocery';
import { cn } from '@/lib/utils';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: GroceryItem[];
  onCompletePurchase: (order: Order) => void;
  onCreateOrder: (items: GroceryItem[], paymentMethod: PaymentMethod, totals: { subtotal: number; tax: number; savings: number; total: number }) => Order;
  budget: { total: number; remaining: number };
}

type CheckoutStep = 'review' | 'payment' | 'processing' | 'tracking';

export function CheckoutModal({ 
  open, 
  onOpenChange, 
  items, 
  onCompletePurchase,
  onCreateOrder,
  budget 
}: CheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>('review');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  const checkedItems = items.filter(i => i.isChecked);
  const subtotal = checkedItems.reduce((sum, item) => {
    const price = item.hasDeal && item.dealPrice ? item.dealPrice : item.price;
    return sum + price * item.quantity;
  }, 0);
  const savings = checkedItems.reduce((sum, item) => {
    if (item.hasDeal && item.dealPrice) {
      return sum + (item.price - item.dealPrice) * item.quantity;
    }
    return sum;
  }, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  
  const isOverBudget = total > budget.remaining;
  
  const handlePayment = () => {
    if (!selectedPayment) return;
    
    setStep('processing');
    setProcessingProgress(0);
    
    // Simulate payment processing
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Create the order and show tracking
          const order = onCreateOrder(checkedItems, selectedPayment, { subtotal, tax, savings, total });
          setCurrentOrder(order);
          setStep('tracking');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  
  const handleComplete = () => {
    if (currentOrder) {
      onCompletePurchase(currentOrder);
    }
    onOpenChange(false);
    setStep('review');
    setProcessingProgress(0);
    setSelectedPayment(null);
    setCurrentOrder(null);
  };
  
  const handleClose = (newOpen: boolean) => {
    if (!newOpen && step !== 'processing') {
      onOpenChange(false);
      setStep('review');
      setProcessingProgress(0);
      setSelectedPayment(null);
      setCurrentOrder(null);
    }
  };
  
  // Show order tracking view
  if (step === 'tracking' && currentOrder) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0">
          <OrderTracking order={currentOrder} onClose={handleComplete} />
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'review' && <><ShoppingCart className="h-5 w-5 text-primary" /> Review Purchase</>}
            {step === 'payment' && <><CreditCard className="h-5 w-5 text-primary" /> Payment</>}
            {step === 'processing' && <><Package className="h-5 w-5 text-primary animate-pulse" /> Processing...</>}
          </DialogTitle>
          <DialogDescription>
            {step === 'review' && `${checkedItems.length} items • Total: $${total.toFixed(2)}`}
            {step === 'payment' && 'Choose your preferred payment method'}
            {step === 'processing' && 'Please wait while we process your order'}
          </DialogDescription>
        </DialogHeader>
        
        {step === 'review' && (
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {/* Total Summary at Top */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{checkedItems.length} items</p>
                  {savings > 0 && (
                    <Badge variant="deal" className="mt-1">Save ${savings.toFixed(2)}</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 py-2">
              {checkedItems.map(item => {
                const price = item.hasDeal && item.dealPrice ? item.dealPrice : item.price;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                    <ProductImage name={item.name} category={item.category} image={item.image} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit} × ${price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(price * item.quantity).toFixed(2)}</p>
                      {item.hasDeal && (
                        <Badge variant="deal" className="text-xs">Deal</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {step === 'payment' && (
          <div className="flex-1 overflow-y-auto -mx-6 px-6 py-2">
            <PaymentMethods 
              selectedMethod={selectedPayment}
              onSelect={setSelectedPayment}
              total={total}
            />
          </div>
        )}
        
        {step === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                <Package className="h-12 w-12 text-primary animate-bounce" />
              </div>
              <div className="absolute -inset-2 rounded-full border-2 border-primary/20 border-dashed animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="w-full max-w-xs space-y-2">
              <Progress value={processingProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {processingProgress < 30 && 'Connecting to payment gateway...'}
                {processingProgress >= 30 && processingProgress < 60 && 'Processing payment...'}
                {processingProgress >= 60 && processingProgress < 90 && 'Confirming order...'}
                {processingProgress >= 90 && 'Almost done...'}
              </p>
            </div>
            {selectedPayment && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Paying with</span>
                <Badge variant="secondary" className="capitalize">{selectedPayment}</Badge>
              </div>
            )}
          </div>
        )}
        
        <Separator className="my-2" />
        
        {/* Order Summary */}
        {step !== 'processing' && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Savings</span>
                <span>-${savings.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className={cn(isOverBudget && 'text-destructive')}>${total.toFixed(2)}</span>
            </div>
            {isOverBudget && (
              <p className="text-xs text-destructive">⚠️ This exceeds your remaining budget of ${budget.remaining.toFixed(2)}</p>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {step === 'review' && (
            <>
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={() => setStep('payment')}
                disabled={checkedItems.length === 0}
              >
                <CreditCard className="h-4 w-4" />
                Proceed to Payment
              </Button>
            </>
          )}
          {step === 'payment' && (
            <>
              <Button variant="outline" className="flex-1" onClick={() => setStep('review')}>
                Back
              </Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={handlePayment}
                disabled={!selectedPayment}
              >
                <Truck className="h-4 w-4" />
                Pay ${total.toFixed(2)}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}