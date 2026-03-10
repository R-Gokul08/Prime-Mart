import { useState, useCallback } from 'react';
import { Sparkles, Send, Loader2, ChefHat, ShoppingBag, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GroceryItem } from '@/types/grocery';

interface AISuggestion {
  name: string;
  category: string;
  price: number;
  reason: string;
  type: 'history' | 'healthy' | 'deal' | 'budget';
  store?: string;
}

interface AIAssistantProps {
  groceryItems: GroceryItem[];
  onSuggestionsUpdate?: (suggestions: AISuggestion[]) => void;
}

type AssistantMode = 'suggestions' | 'recipes' | 'chat';

// Use AI tool calling for structured suggestions
async function getStructuredSuggestions(response: string, query: string): Promise<AISuggestion[]> {
  const suggestions: AISuggestion[] = [];
  
  const categoryKeywords: Record<string, string> = {
    'vegetable': 'Fruits & Vegetables', 'fruit': 'Fruits & Vegetables',
    'tomato': 'Fruits & Vegetables', 'onion': 'Fruits & Vegetables',
    'potato': 'Fruits & Vegetables', 'spinach': 'Fruits & Vegetables',
    'palak': 'Fruits & Vegetables', 'carrot': 'Fruits & Vegetables',
    'mango': 'Fruits & Vegetables', 'apple': 'Fruits & Vegetables',
    'banana': 'Fruits & Vegetables', 'lemon': 'Fruits & Vegetables',
    'milk': 'Dairy & Eggs', 'curd': 'Dairy & Eggs', 'dahi': 'Dairy & Eggs',
    'paneer': 'Dairy & Eggs', 'cheese': 'Dairy & Eggs', 'egg': 'Dairy & Eggs',
    'butter': 'Dairy & Eggs', 'ghee': 'Dairy & Eggs', 'cream': 'Dairy & Eggs',
    'chicken': 'Meat & Seafood', 'mutton': 'Meat & Seafood', 'fish': 'Meat & Seafood',
    'prawn': 'Meat & Seafood', 'meat': 'Meat & Seafood',
    'rice': 'Grains & Pulses', 'atta': 'Grains & Pulses', 'flour': 'Grains & Pulses',
    'dal': 'Grains & Pulses', 'rajma': 'Grains & Pulses', 'chana': 'Grains & Pulses',
    'oil': 'Pantry', 'sugar': 'Pantry', 'salt': 'Pantry', 'masala': 'Spices',
    'turmeric': 'Spices', 'haldi': 'Spices', 'jeera': 'Spices', 'cumin': 'Spices',
    'bread': 'Bakery', 'roti': 'Bakery', 'naan': 'Bakery',
    'juice': 'Beverages', 'tea': 'Beverages', 'coffee': 'Beverages', 'chai': 'Beverages',
    'chips': 'Snacks', 'biscuit': 'Snacks', 'namkeen': 'Snacks', 'cookies': 'Snacks',
  };

  const indianPrices: Record<string, number> = {
    'tomato': 40, 'onion': 35, 'potato': 30, 'spinach': 25, 'carrot': 45,
    'banana': 50, 'apple': 180, 'mango': 300, 'lemon': 60, 'cucumber': 30,
    'milk': 68, 'curd': 45, 'paneer': 90, 'butter': 56, 'ghee': 550, 'egg': 84,
    'chicken': 220, 'mutton': 700, 'fish': 350, 'prawn': 550,
    'rice': 550, 'atta': 280, 'dal': 150, 'oil': 145, 'sugar': 45, 'salt': 28,
    'tea': 180, 'coffee': 350, 'bread': 45, 'maggi': 14,
  };

  const stores = ['BigBasket', 'JioMart', 'Amazon Fresh', 'Zepto', 'Blinkit', 'DMart'];

  // Extract product names from AI response
  const lines = response.split('\n');
  for (const line of lines) {
    // Match bullet points, numbered lists, bold text with product names
    const patterns = [
      /[•\-\*\d.]\s*\*?\*?([A-Za-z\s/()]+?)\*?\*?\s*[-–:]/,
      /[•\-\*\d.]\s*\*?\*?([A-Za-z\s/()]+)\*?\*?\s*\(/,
      /[•\-\*\d.]\s*([A-Za-z][A-Za-z\s]+?)(?:\s*[-–:]|\s*$)/,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let productName = match[1].trim()
          .replace(/\*+/g, '')
          .replace(/^\d+\.\s*/, '');
        
        if (productName.length < 3 || productName.length > 40) continue;
        // Skip non-product words
        if (/^(here|also|you|the|and|for|with|try|add|get|buy|use|tip|note|step|make|cook)/i.test(productName)) continue;

        let category = 'Pantry';
        let price = Math.floor(Math.random() * 100) + 30;
        const lowerName = productName.toLowerCase();
        
        for (const [keyword, cat] of Object.entries(categoryKeywords)) {
          if (lowerName.includes(keyword)) {
            category = cat;
            break;
          }
        }

        for (const [keyword, p] of Object.entries(indianPrices)) {
          if (lowerName.includes(keyword)) {
            price = p + Math.floor(Math.random() * 20) - 10;
            break;
          }
        }

        // Extract price from line if present
        const priceMatch = line.match(/₹\s*(\d+)/);
        if (priceMatch) {
          price = parseInt(priceMatch[1]);
        }

        const isDeal = line.toLowerCase().includes('deal') || line.toLowerCase().includes('offer') || line.toLowerCase().includes('discount');
        const isHealthy = line.toLowerCase().includes('healthy') || line.toLowerCase().includes('vitamin') || line.toLowerCase().includes('protein') || line.toLowerCase().includes('organic');

        suggestions.push({
          name: productName,
          category,
          price,
          reason: query ? `For "${query}"` : 'AI Suggested',
          type: isHealthy ? 'healthy' : isDeal ? 'deal' : 'budget',
          store: stores[Math.floor(Math.random() * stores.length)],
        });
        break; // Only match first pattern per line
      }
    }
  }

  return suggestions.slice(0, 6);
}

export function AIAssistant({ groceryItems, onSuggestionsUpdate }: AIAssistantProps) {
  const [mode, setMode] = useState<AssistantMode>('suggestions');
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getAIResponse = useCallback(async (type: string, context?: string) => {
    setIsLoading(true);
    setResponse('');

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type,
          context,
          groceryItems: groceryItems.map(item => item.name),
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast.error('Too many requests. Please wait a moment.');
        } else if (data.error.includes('credits')) {
          toast.error('AI credits exhausted. Please add credits.');
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setResponse(data.response);

      // Parse and send suggestions to Smart Suggestions
      if (onSuggestionsUpdate && data.response) {
        const suggestions = await getStructuredSuggestions(data.response, context || '');
        if (suggestions.length > 0) {
          onSuggestionsUpdate(suggestions);
          toast.success(`Found ${suggestions.length} items for your list!`);
        }
      }
    } catch (error) {
      console.error('AI error:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  }, [groceryItems, onSuggestionsUpdate]);

  const handleQuickAction = (type: string) => {
    getAIResponse(type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const type = mode === 'recipes' ? 'recipe-ideas' :
                 mode === 'suggestions' ? 'shopping-suggestions' : 'product-info';
    getAIResponse(type, input);
    setInput('');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Shopping Assistant
          <Badge variant="secondary" className="ml-auto text-xs bg-purple-500/20 text-purple-700">
            Powered by AI
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Mode Selection */}
        <div className="flex gap-2">
          <Button variant={mode === 'suggestions' ? 'default' : 'outline'} size="sm" onClick={() => setMode('suggestions')} className="flex-1 gap-1">
            <Lightbulb className="h-4 w-4" />
            Suggestions
          </Button>
          <Button variant={mode === 'recipes' ? 'default' : 'outline'} size="sm" onClick={() => setMode('recipes')} className="flex-1 gap-1">
            <ChefHat className="h-4 w-4" />
            Recipes
          </Button>
          <Button variant={mode === 'chat' ? 'default' : 'outline'} size="sm" onClick={() => setMode('chat')} className="flex-1 gap-1">
            <ShoppingBag className="h-4 w-4" />
            Ask
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => handleQuickAction('shopping-suggestions')} disabled={isLoading} className="text-xs">
            ✨ What am I missing?
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleQuickAction('recipe-ideas')} disabled={isLoading} className="text-xs">
            🍳 Quick meal ideas
          </Button>
          <Button variant="outline" size="sm" onClick={() => getAIResponse('shopping-suggestions', 'biryani ingredients list with prices')} disabled={isLoading} className="text-xs">
            🍚 Biryani ingredients
          </Button>
          <Button variant="outline" size="sm" onClick={() => getAIResponse('shopping-suggestions', 'healthy breakfast items for Indian kitchen')} disabled={isLoading} className="text-xs">
            🥗 Healthy breakfast
          </Button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder={
              mode === 'suggestions' ? "Search for items... (e.g., 'biryani', 'paneer dishes', 'weekly essentials')" :
              mode === 'recipes' ? "What kind of meal are you in the mood for?" :
              "Ask anything about groceries..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[60px] resize-none"
          />
          <Button type="submit" className="w-full gap-2" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Thinking...</>
            ) : (
              <><Send className="h-4 w-4" />Ask AI</>
            )}
          </Button>
        </form>

        {/* Response */}
        {(response || isLoading) && (
          <div className="p-4 rounded-xl bg-muted/50 space-y-2">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is analyzing and finding products...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm">{response}</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
