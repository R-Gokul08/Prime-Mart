import { Trash2, Plus, Minus, Heart, Tag } from 'lucide-react';
import { GroceryItem as GroceryItemType } from '@/types/grocery';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductImage } from '@/components/ProductImage';
import { cn } from '@/lib/utils';

interface GroceryItemProps {
  item: GroceryItemType;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export function GroceryItemCard({ item, onToggle, onRemove, onUpdateQuantity }: GroceryItemProps) {
  const displayPrice = item.hasDeal && item.dealPrice ? item.dealPrice : item.price;
  const totalPrice = displayPrice * item.quantity;

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-300 animate-fade-in",
        item.isChecked && "opacity-60 bg-muted/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="pt-1">
          <Checkbox
            checked={item.isChecked}
            onCheckedChange={() => onToggle(item.id)}
            className="h-5 w-5 rounded-md"
          />
        </div>
        
        <ProductImage 
          name={item.name} 
          category={item.category} 
          image={item.image} 
          size="md" 
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={cn(
                "font-semibold text-foreground truncate",
                item.isChecked && "line-through"
              )}>
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground">{item.store}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {item.isHealthy && (
                <Badge variant="healthy" className="gap-1">
                  <Heart className="h-3 w-3" />
                  Healthy
                </Badge>
              )}
              {item.hasDeal && (
                <Badge variant="deal" className="gap-1">
                  <Tag className="h-3 w-3" />
                  Deal
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <span className="text-sm text-muted-foreground ml-1">{item.unit}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                {item.hasDeal && item.dealPrice && (
                  <p className="text-xs text-muted-foreground line-through">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                )}
                <p className="font-bold text-lg">${totalPrice.toFixed(2)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {item.expiryDays && item.expiryDays <= 5 && (
            <div className="mt-2 flex items-center gap-1.5">
              <Badge variant="warning" className="text-xs">
                ⏰ Expires in {item.expiryDays} days
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
