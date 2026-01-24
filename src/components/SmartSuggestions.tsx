import { Sparkles, Plus, History, Heart, Tag, Wallet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SmartSuggestion } from '@/types/grocery';
import { smartSuggestions } from '@/data/mockData';
import { formatPrice } from '@/lib/currency';

interface SmartSuggestionsProps {
  onAddItem: (item: SmartSuggestion['item']) => void;
}

const typeIcons = {
  history: History,
  healthy: Heart,
  deal: Tag,
  budget: Wallet,
};

const typeColors = {
  history: 'bg-primary/10 text-primary',
  healthy: 'bg-healthy/10 text-healthy',
  deal: 'bg-deal/10 text-deal',
  budget: 'bg-accent/10 text-accent',
};

export function SmartSuggestions({ onAddItem }: SmartSuggestionsProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-accent" />
          Smart Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {smartSuggestions.map((suggestion) => {
            const Icon = typeIcons[suggestion.type];
            return (
              <div
                key={suggestion.id}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${typeColors[suggestion.type]}`}>
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
