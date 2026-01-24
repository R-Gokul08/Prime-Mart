import { useState } from 'react';
import { CreditCard, Smartphone, ChevronRight } from 'lucide-react';
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
  icon: React.ReactNode;
  color: string;
  description: string;
}

// Google Pay logo component
const GooglePayIcon = () => (
  <svg viewBox="0 0 41 17" className="h-5 w-auto">
    <g fill="none" fillRule="evenodd">
      <path fill="#5F6368" d="M19.526 2.635v4.083h2.518c.6 0 1.096-.202 1.488-.605.403-.402.605-.882.605-1.437 0-.544-.202-1.018-.605-1.422-.392-.413-.888-.62-1.488-.62h-2.518zm0 5.52v4.736h-1.504V1.198h3.99c1.013 0 1.873.337 2.582 1.012.72.675 1.08 1.497 1.08 2.466 0 .991-.36 1.819-1.08 2.482-.697.665-1.559.997-2.583.997h-2.485v-.001z"/>
      <path fill="#5F6368" d="M27.194 10.442c0 .392.166.718.499.98.332.26.722.391 1.168.391.633 0 1.196-.234 1.692-.701.497-.469.744-1.019.744-1.65-.469-.37-1.123-.555-1.962-.555-.61 0-1.12.148-1.528.442-.409.294-.613.657-.613 1.093m1.946-5.815c1.112 0 1.989.297 2.633.89.642.594.964 1.408.964 2.442v4.932h-1.439v-1.11h-.065c-.622.914-1.45 1.372-2.486 1.372-.882 0-1.621-.262-2.215-.784-.594-.523-.891-1.176-.891-1.96 0-.828.313-1.486.94-1.976s1.463-.735 2.51-.735c.892 0 1.629.163 2.206.49v-.344c0-.522-.207-.966-.621-1.33-.414-.365-.848-.546-1.504-.546-.871 0-1.56.37-2.065 1.11l-1.325-.826c.749-1.1 1.871-1.649 3.358-1.649"/>
      <path fill="#5F6368" d="M40.993 4.889l-5.02 11.53H34.42l1.864-4.034-3.302-7.496h1.635l2.387 5.749h.032l2.322-5.75z"/>
      <path fill="#4285F4" d="M13.448 7.134c0-.473-.04-.93-.116-1.366H6.988v2.588h3.634c-.156.846-.633 1.561-1.346 2.04v1.693h2.178c1.276-1.174 2.013-2.902 2.013-4.955"/>
      <path fill="#34A853" d="M6.988 13.7c1.816 0 3.344-.595 4.459-1.621l-2.178-1.693c-.603.406-1.38.643-2.281.643-1.754 0-3.238-1.181-3.767-2.771H.97v1.747c1.108 2.193 3.38 3.695 6.018 3.695"/>
      <path fill="#FBBC05" d="M3.22 8.258a3.913 3.913 0 010-2.494V4.017H.97a6.574 6.574 0 000 5.988l2.25-1.747z"/>
      <path fill="#EA4335" d="M6.988 2.993c.992 0 1.88.34 2.58 1.008v.001l1.92-1.918C10.324.928 8.804.322 6.988.322c-2.637 0-4.91 1.502-6.018 3.695l2.25 1.747c.53-1.59 2.014-2.771 3.768-2.771"/>
    </g>
  </svg>
);

const paymentOptions: PaymentOption[] = [
  { 
    id: 'googlepay', 
    name: 'Google Pay', 
    icon: <GooglePayIcon />, 
    color: 'from-white to-gray-50', 
    description: 'Fast & secure UPI payment' 
  },
  { id: 'paytm', name: 'Paytm', icon: <span className="text-2xl">💙</span>, color: 'from-blue-500/20 to-blue-600/10', description: 'Pay with Paytm Wallet or UPI' },
  { id: 'phonepe', name: 'PhonePe', icon: <span className="text-2xl">💜</span>, color: 'from-purple-500/20 to-purple-600/10', description: 'Pay via PhonePe UPI' },
  { id: 'upi', name: 'Other UPI', icon: <span className="text-2xl">📱</span>, color: 'from-orange-500/20 to-orange-600/10', description: 'Enter your UPI ID' },
  { id: 'card', name: 'Credit/Debit Card', icon: <CreditCard className="h-6 w-6" />, color: 'from-gray-500/20 to-gray-600/10', description: 'Visa, Mastercard, RuPay' },
  { id: 'cash', name: 'Cash on Delivery', icon: <span className="text-2xl">💵</span>, color: 'from-green-500/20 to-green-600/10', description: 'Pay when you receive' },
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
            <div className="flex items-center justify-center w-10 h-10">
              {option.icon}
            </div>
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
            <div className="w-8 h-8 flex items-center justify-center">
              {paymentOptions.find(p => p.id === selectedMethod)?.icon}
            </div>
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