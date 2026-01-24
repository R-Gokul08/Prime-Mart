import { useMemo } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GroceryItem } from '@/types/grocery';
import { categoryEmojis } from '@/lib/productImages';

interface ExpiryRemindersProps {
  items?: GroceryItem[];
}

// Sample expiring items when no user items are available
const sampleExpiringItems = [
  { name: 'Milk', daysLeft: 2, icon: '🥛', category: 'Dairy & Eggs' },
  { name: 'Coriander', daysLeft: 3, icon: '🌿', category: 'Fruits & Vegetables' },
  { name: 'Chicken', daysLeft: 1, icon: '🍗', category: 'Meat & Seafood' },
  { name: 'Bread', daysLeft: 4, icon: '🍞', category: 'Bakery' },
  { name: 'Yogurt', daysLeft: 5, icon: '🥛', category: 'Dairy & Eggs' },
  { name: 'Tomatoes', daysLeft: 3, icon: '🍅', category: 'Fruits & Vegetables' },
  { name: 'Fish', daysLeft: 1, icon: '🐟', category: 'Meat & Seafood' },
  { name: 'Paneer', daysLeft: 4, icon: '🧀', category: 'Dairy & Eggs' },
];

export function ExpiryReminders({ items = [] }: ExpiryRemindersProps) {
  const expiringItems = useMemo(() => {
    // If user has items with expiry, use those
    const userExpiringItems = items
      .filter(item => item.expiryDays && item.expiryDays <= 7 && !item.isChecked)
      .map(item => ({
        name: item.name,
        daysLeft: item.expiryDays || 0,
        icon: categoryEmojis[item.category] || '🛒',
        category: item.category,
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);

    // If user has expiring items, show those
    if (userExpiringItems.length > 0) {
      return userExpiringItems.slice(0, 4);
    }

    // Otherwise show random sample items
    const shuffled = [...sampleExpiringItems].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [items]);

  if (expiringItems.length === 0) {
    return null;
  }

  return (
    <Card className="animate-fade-in border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Expiring Soon
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {expiringItems.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="flex items-center justify-between p-3 rounded-xl bg-card"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </div>
              <Badge variant={item.daysLeft <= 2 ? "destructive" : "warning"} className="gap-1">
                <Clock className="h-3 w-3" />
                {item.daysLeft} days
              </Badge>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Use these items soon to reduce food waste 🌱
        </p>
      </CardContent>
    </Card>
  );
}
