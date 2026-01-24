import { Sparkles, Plus, History, Heart, Tag, Wallet, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SmartSuggestion, GroceryItem } from '@/types/grocery';
import { smartSuggestions } from '@/data/mockData';
import { formatPrice } from '@/lib/currency';
import { ProductImage } from './ProductImage';

interface SmartSuggestionsProps {
  onAddItem: (item: SmartSuggestion['item']) => void;
  aiSuggestions?: Array<{
    name: string;
    category: string;
    price: number;
    reason: string;
    type: 'history' | 'healthy' | 'deal' | 'budget';
    store?: string;
  }>;
}

const typeIcons = {
  history: History,
  healthy: Heart,
  deal: Tag,
  budget: Wallet,
  search: Search,
};

const typeColors = {
  history: 'bg-primary/10 text-primary',
  healthy: 'bg-healthy/10 text-healthy',
  deal: 'bg-deal/10 text-deal',
  budget: 'bg-accent/10 text-accent',
  search: 'bg-secondary/80 text-secondary-foreground',
};

export function SmartSuggestions({ onAddItem, aiSuggestions = [] }: SmartSuggestionsProps) {
  // Combine AI suggestions with default suggestions
  const combinedSuggestions = [
    // AI-generated suggestions first
    ...aiSuggestions.map((suggestion, index) => ({
      id: `ai-${index}`,
      item: {
        id: `ai-item-${index}`,
        name: suggestion.name,
        category: suggestion.category,
        quantity: 1,
        unit: 'pcs',
        price: suggestion.price,
        isHealthy: suggestion.type === 'healthy',
        hasDeal: suggestion.type === 'deal',
        dealPrice: suggestion.type === 'deal' ? Math.round(suggestion.price * 0.8) : undefined,
        store: suggestion.store || 'BigBasket',
        isChecked: false,
        addedAt: new Date(),
      } as GroceryItem,
      reason: suggestion.reason,
      type: suggestion.type,
    })),
    // Default suggestions
    ...smartSuggestions,
  ].slice(0, 6); // Limit to 6 items

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-accent" />
          Smart Suggestions
          {aiSuggestions.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              AI Powered
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {combinedSuggestions.map((suggestion) => {
            const Icon = typeIcons[suggestion.type] || Search;
            return (
              <div
                key={suggestion.id}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ProductImage 
                    name={suggestion.item.name}
                    category={suggestion.item.category}
                    size="sm"
                  />
                  <div className={`p-2 rounded-lg ${typeColors[suggestion.type] || typeColors.budget}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{suggestion.item.name}</p>
                    <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {suggestion.item.hasDeal && suggestion.item.dealPrice ? (
                      <>
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(suggestion.item.price)}
                        </p>
                        <p className="font-bold text-deal">
                          {formatPrice(suggestion.item.dealPrice)}
                        </p>
                      </>
                    ) : (
                      <p className="font-bold">{formatPrice(suggestion.item.price)}</p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => onAddItem(suggestion.item)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}