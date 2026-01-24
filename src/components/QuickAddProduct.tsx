import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductImage } from '@/components/ProductImage';
import { GroceryItem } from '@/types/grocery';
import { formatPrice } from '@/lib/currency';

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

// Best Indian grocery products from online stores
const quickAddProducts = [
  { name: 'Tata Salt 1kg', category: 'Pantry', price: 28, unit: 'pack', isHealthy: true, hasDeal: false, store: 'BigBasket' },
  { name: 'Fortune Sunflower Oil 1L', category: 'Pantry', price: 145, unit: 'bottle', isHealthy: true, hasDeal: true, dealPrice: 125, store: 'JioMart' },
  { name: 'Amul Butter 500g', category: 'Dairy & Eggs', price: 275, unit: 'pack', isHealthy: false, hasDeal: false, store: 'Zepto' },
  { name: 'Aashirvaad Atta 5kg', category: 'Grains', price: 295, unit: 'bag', isHealthy: true, hasDeal: true, dealPrice: 265, store: 'BigBasket' },
  { name: 'Fresh Bananas 1 Dozen', category: 'Fruits & Vegetables', price: 50, unit: 'dozen', isHealthy: true, hasDeal: false, store: 'Blinkit' },
  { name: 'Toor Dal 1kg', category: 'Grains', price: 165, unit: 'pack', isHealthy: true, hasDeal: true, dealPrice: 145, store: 'DMart' },
  { name: 'Mother Dairy Milk 1L', category: 'Dairy & Eggs', price: 68, unit: 'pack', isHealthy: true, hasDeal: false, store: 'Zepto' },
  { name: 'Maggi Noodles 12 Pack', category: 'Pantry', price: 168, unit: 'pack', isHealthy: false, hasDeal: true, dealPrice: 145, store: 'Amazon Fresh' },
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
      store: product.store || 'BigBasket',
    });
  };

  return (
    <Card className="p-4">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        ⚡ Quick Add
        <Badge variant="secondary" className="text-xs">From Online Stores</Badge>
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
              <p className="text-[10px] text-muted-foreground">{product.store}</p>
              <div className="flex items-center gap-1">
                {product.hasDeal && product.dealPrice ? (
                  <>
                    <span className="text-xs font-bold text-primary">{formatPrice(product.dealPrice)}</span>
                    <span className="text-[10px] text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  </>
                ) : (
                  <span className="text-xs font-bold">{formatPrice(product.price)}</span>
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
