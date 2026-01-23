import { useState } from 'react';
import { ShoppingCart, CreditCard, CheckCircle2, Package, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProductImage } from '@/components/ProductImage';
import { GroceryItem } from '@/types/grocery';
import { cn } from '@/lib/utils';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: GroceryItem[];
  onCompletePurchase: () => void;
  budget: { total: number; remaining: number };
}

type CheckoutStep = 'review' | 'payment' | 'processing' | 'complete';

export function CheckoutModal({ 
  open, 
  onOpenChange, 
  items, 
  onCompletePurchase,
  budget 
}: CheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>('review');
  const [processingProgress, setProcessingProgress] = useState(0);
  
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
    setStep('processing');
    setProcessingProgress(0);
    
    // Simulate payment processing
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep('complete');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };
  
  const handleComplete = () => {
    onCompletePurchase();
    onOpenChange(false);
    setStep('review');
    setProcessingProgress(0);
  };
  
  const handleClose = (newOpen: boolean) => {
    if (!newOpen && step !== 'processing') {
      onOpenChange(false);
      setStep('review');
      setProcessingProgress(0);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'review' && <><ShoppingCart className="h-5 w-5 text-primary" /> Review Purchase</>}
            {step === 'payment' && <><CreditCard className="h-5 w-5 text-primary" /> Payment</>}
            {step === 'processing' && <><Package className="h-5 w-5 text-primary animate-pulse" /> Processing...</>}
            {step === 'complete' && <><CheckCircle2 className="h-5 w-5 text-green-500" /> Purchase Complete!</>}
          </DialogTitle>
          <DialogDescription>
            {step === 'review' && `${checkedItems.length} items ready for purchase`}
            {step === 'payment' && 'Confirm your payment details'}
            {step === 'processing' && 'Please wait while we process your order'}
            {step === 'complete' && 'Your items have been added to inventory'}
          </DialogDescription>
        </DialogHeader>
        
        {step === 'review' && (
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
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
                        <Badge variant="deal" className="text-xs">Save ${((item.price - item.dealPrice!) * item.quantity).toFixed(2)}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {step === 'payment' && (
          <div className="flex-1 space-y-4 py-2">
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="font-semibold">Payment Method</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-12 justify-start">
                  💳 Credit Card
                </Button>
                <Button variant="outline" className="h-12 justify-start">
                  📱 Apple Pay
                </Button>
                <Button variant="outline" className="h-12 justify-start">
                  🏦 Bank Transfer
                </Button>
                <Button variant="outline" className="h-12 justify-start">
                  💰 Cash
                </Button>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">Delivery Address</p>
              <p className="font-medium">123 Smart Street, Cart City, SC 12345</p>
            </div>
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
                {processingProgress < 30 && 'Verifying items...'}
                {processingProgress >= 30 && processingProgress < 60 && 'Processing payment...'}
                {processingProgress >= 60 && processingProgress < 90 && 'Updating inventory...'}
                {processingProgress >= 90 && 'Almost done...'}
              </p>
            </div>
          </div>
        )}
        
        {step === 'complete' && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500 animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-2xl font-bold">Thank You!</p>
              <p className="text-muted-foreground">Your purchase was successful</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              {checkedItems.length} items added to inventory
            </div>
            {savings > 0 && (
              <Badge variant="deal" className="text-base px-4 py-1">
                You saved ${savings.toFixed(2)} today! 🎉
              </Badge>
            )}
          </div>
        )}
        
        <Separator className="my-2" />
        
        {/* Order Summary */}
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
              <Button className="flex-1 gap-2" onClick={handlePayment}>
                <CheckCircle2 className="h-4 w-4" />
                Confirm Purchase
              </Button>
            </>
          )}
          {step === 'complete' && (
            <Button className="w-full gap-2" onClick={handleComplete}>
              <Sparkles className="h-4 w-4" />
              Done
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
