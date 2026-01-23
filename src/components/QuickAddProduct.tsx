import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductImage } from '@/components/ProductImage';
import { GroceryItem } from '@/types/grocery';

interface QuickAddProductProps {
  products: Array<{
    name: string;
    category: string;
    price: number;
    unit: string;
    hasDeal?: boolean;
    dealPrice?: number;
    isHealthy?: boolean;
  }>;
  onAdd: (item: Omit<GroceryItem, 'id' | 'addedAt' | 'isChecked'>) => void;
}

const quickAddProducts = [
  { name: 'Organic Bananas', category: 'Fruits & Vegetables', price: 2.99, unit: 'bunch', isHealthy: true, hasDeal: true, dealPrice: 1.99 },
  { name: 'Greek Yogurt', category: 'Dairy & Eggs', price: 5.49, unit: 'cups', isHealthy: true },
  { name: 'Whole Wheat Bread', category: 'Bakery', price: 4.29, unit: 'loaf', isHealthy: true },
  { name: 'Atlantic Salmon', category: 'Meat & Seafood', price: 12.99, unit: 'lb', isHealthy: true, hasDeal: true, dealPrice: 9.99 },
  { name: 'Avocados', category: 'Fruits & Vegetables', price: 4.99, unit: 'pcs', isHealthy: true },
  { name: 'Almond Milk', category: 'Beverages', price: 4.49, unit: 'carton', isHealthy: true },
  { name: 'Olive Oil', category: 'Pantry', price: 8.99, unit: 'bottle', isHealthy: true, hasDeal: true, dealPrice: 5.99 },
  { name: 'Brown Rice', category: 'Pantry', price: 3.49, unit: 'bag', isHealthy: true },
];

export function QuickAddProduct({ onAdd }: QuickAddProductProps) {
  const handleAdd = (product: typeof quickAddProducts[0]) => {
    onAdd({
      name: product.name,
      category: product.category,
      quantity: 1,
      unit: product.unit,
      price: product.price,
      isHealthy: product.isHealthy || false,
      hasDeal: product.hasDeal || false,
      dealPrice: product.dealPrice,
      store: 'FreshMart',
    });
  };

  return (
    <Card className="p-4">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        ⚡ Quick Add
        <Badge variant="secondary" className="text-xs">Popular</Badge>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickAddProducts.map((product) => (
          <button
            key={product.name}
            onClick={() => handleAdd(product)}
            className="group p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all duration-200 text-left space-y-2 relative overflow-hidden"
          >
            {product.hasDeal && (
              <Badge 
                variant="deal" 
                className="absolute top-1 right-1 text-[10px] px-1.5 py-0"
              >
                Sale
              </Badge>
            )}
            <div className="flex justify-center">
              <ProductImage name={product.name} category={product.category} size="md" />
            </div>
            <div className="space-y-0.5">
              <p className="font-medium text-xs truncate">{product.name}</p>
              <div className="flex items-center gap-1">
                {product.hasDeal && product.dealPrice ? (
                  <>
                    <span className="text-xs font-bold text-primary">${product.dealPrice.toFixed(2)}</span>
                    <span className="text-[10px] text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-xs font-bold">${product.price.toFixed(2)}</span>
                )}
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-primary/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
              <Plus className="h-6 w-6 text-primary-foreground" />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
