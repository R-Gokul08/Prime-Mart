import { useState } from 'react';
import { CreditCard, Smartphone, Building2, Banknote, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentMethod } from '@/types/grocery';
import { cn } from '@/lib/utils';

interface PaymentMethodsProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  total: number;
}

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const paymentOptions: PaymentOption[] = [
  { id: 'paytm', name: 'Paytm', icon: '💙', color: 'from-blue-500/20 to-blue-600/10', description: 'Pay with Paytm Wallet or UPI' },
  { id: 'googlepay', name: 'Google Pay', icon: '🔷', color: 'from-green-500/20 to-blue-500/10', description: 'Fast & secure UPI payment' },
  { id: 'phonepe', name: 'PhonePe', icon: '💜', color: 'from-purple-500/20 to-purple-600/10', description: 'Pay via PhonePe UPI' },
  { id: 'upi', name: 'Other UPI', icon: '📱', color: 'from-orange-500/20 to-orange-600/10', description: 'Enter your UPI ID' },
  { id: 'card', name: 'Credit/Debit Card', icon: '💳', color: 'from-gray-500/20 to-gray-600/10', description: 'Visa, Mastercard, RuPay' },
  { id: 'cash', name: 'Cash on Delivery', icon: '💵', color: 'from-green-500/20 to-green-600/10', description: 'Pay when you receive' },
];

export function PaymentMethods({ selectedMethod, onSelect, total }: PaymentMethodsProps) {
  const [upiId, setUpiId] = useState('');
  const [showUpiInput, setShowUpiInput] = useState(false);

  const handleSelect = (method: PaymentMethod) => {
    onSelect(method);
    setShowUpiInput(method === 'upi');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          Select Payment Method
        </h3>
        <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
      </div>

      <div className="grid gap-2">
        {paymentOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4",
              "hover:border-primary/50 hover:shadow-md",
              selectedMethod === option.id 
                ? "border-primary bg-gradient-to-r " + option.color
                : "border-muted bg-card"
            )}
          >
            <div className="text-2xl">{option.icon}</div>
            <div className="flex-1">
              <p className="font-medium">{option.name}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
            <ChevronRight className={cn(
              "h-5 w-5 transition-transform",
              selectedMethod === option.id ? "text-primary rotate-90" : "text-muted-foreground"
            )} />
          </button>
        ))}
      </div>

      {showUpiInput && selectedMethod === 'upi' && (
        <div className="p-4 rounded-xl bg-muted/50 space-y-3 animate-in slide-in-from-top-2">
          <Label htmlFor="upi-id">Enter UPI ID</Label>
          <Input
            id="upi-id"
            placeholder="yourname@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="text-center text-lg"
          />
          <p className="text-xs text-muted-foreground text-center">
            Example: yourname@paytm, yourname@oksbi
          </p>
        </div>
      )}

      {selectedMethod === 'card' && (
        <div className="p-4 rounded-xl bg-muted/50 space-y-3 animate-in slide-in-from-top-2">
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <Input
              id="card-number"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry</Label>
              <Input id="expiry" placeholder="MM/YY" maxLength={5} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" placeholder="***" type="password" maxLength={3} />
            </div>
          </div>
        </div>
      )}

      {selectedMethod && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-2xl">{paymentOptions.find(p => p.id === selectedMethod)?.icon}</span>
            <span>
              Pay <span className="font-bold">${total.toFixed(2)}</span> using{' '}
              <span className="font-medium">{paymentOptions.find(p => p.id === selectedMethod)?.name}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}