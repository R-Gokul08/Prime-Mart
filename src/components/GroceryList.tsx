import { ShoppingBag, Trash2, CheckCircle, ShoppingCart } from 'lucide-react';
import { GroceryItem } from '@/types/grocery';
import { GroceryItemCard } from '@/components/GroceryItem';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface GroceryListProps {
  items: GroceryItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearChecked: () => void;
  progress: number;
}

export function GroceryList({
  items,
  onToggle,
  onRemove,
  onUpdateQuantity,
  onClearChecked,
  progress,
}: GroceryListProps) {
  const checkedCount = items.filter(i => i.isChecked).length;
  const uncheckedItems = items.filter(i => !i.isChecked);
  const checkedItems = items.filter(i => i.isChecked);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Your list is empty</h3>
        <p className="text-muted-foreground text-sm">
          Add items to start your smart shopping journey
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Shopping List</h2>
          <span className="text-sm text-muted-foreground">
            {checkedCount}/{items.length} items
          </span>
        </div>
        {checkedCount > 0 && (
          <Button
            variant="hero"
            size="sm"
            className="gap-1"
            onClick={onClearChecked}
          >
            <ShoppingCart className="h-4 w-4" />
            Checkout ({checkedCount})
          </Button>
        )}
      </div>

      <div className="space-y-1">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {progress.toFixed(0)}% complete
        </p>
      </div>

      <div className="space-y-3">
        {uncheckedItems.map((item) => (
          <GroceryItemCard
            key={item.id}
            item={item}
            onToggle={onToggle}
            onRemove={onRemove}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>

      {checkedItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          {checkedItems.map((item) => (
            <GroceryItemCard
              key={item.id}
              item={item}
              onToggle={onToggle}
              onRemove={onRemove}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
