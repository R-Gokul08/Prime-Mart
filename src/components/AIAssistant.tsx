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

// Parse AI response to extract product suggestions
function parseAISuggestions(response: string): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  const lines = response.split('\n');
  
  // Common grocery categories
  const categoryKeywords: Record<string, string> = {
    'vegetable': 'Fruits & Vegetables',
    'fruit': 'Fruits & Vegetables',
    'tomato': 'Fruits & Vegetables',
    'onion': 'Fruits & Vegetables',
    'potato': 'Fruits & Vegetables',
    'spinach': 'Fruits & Vegetables',
    'carrot': 'Fruits & Vegetables',
    'milk': 'Dairy & Eggs',
    'curd': 'Dairy & Eggs',
    'paneer': 'Dairy & Eggs',
    'cheese': 'Dairy & Eggs',
    'egg': 'Dairy & Eggs',
    'butter': 'Dairy & Eggs',
    'chicken': 'Meat & Seafood',
    'mutton': 'Meat & Seafood',
    'fish': 'Meat & Seafood',
    'rice': 'Pantry',
    'atta': 'Pantry',
    'flour': 'Pantry',
    'dal': 'Pantry',
    'oil': 'Pantry',
    'sugar': 'Pantry',
    'salt': 'Pantry',
    'spice': 'Pantry',
    'bread': 'Bakery',
    'juice': 'Beverages',
    'tea': 'Beverages',
    'coffee': 'Beverages',
    'chips': 'Snacks',
    'biscuit': 'Snacks',
    'namkeen': 'Snacks',
  };

  for (const line of lines) {
    // Look for product mentions with prices or bullet points
    const productMatch = line.match(/[•\-\*]?\s*([A-Za-z\s]+)(?:.*?₹?\s*(\d+))?/);
    if (productMatch) {
      const productName = productMatch[1].trim();
      if (productName.length > 2 && productName.length < 50) {
        // Determine category
        let category = 'Pantry';
        const lowerName = productName.toLowerCase();
        for (const [keyword, cat] of Object.entries(categoryKeywords)) {
          if (lowerName.includes(keyword)) {
            category = cat;
            break;
          }
        }
        
        // Random price if not found
        const price = productMatch[2] ? parseInt(productMatch[2]) : Math.floor(Math.random() * 100) + 30;
        
        // Determine suggestion type based on context
        let type: AISuggestion['type'] = 'budget';
        if (line.toLowerCase().includes('healthy') || line.toLowerCase().includes('vitamin') || line.toLowerCase().includes('protein')) {
          type = 'healthy';
        } else if (line.toLowerCase().includes('deal') || line.toLowerCase().includes('offer') || line.toLowerCase().includes('discount')) {
          type = 'deal';
        } else if (line.toLowerCase().includes('forgot') || line.toLowerCase().includes('missing')) {
          type = 'history';
        }
        
        suggestions.push({
          name: productName,
          category,
          price,
          reason: 'AI Suggested',
          type,
          store: 'BigBasket',
        });
      }
    }
  }
  
  return suggestions.slice(0, 4); // Limit to 4 suggestions
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

      if (error) {
        throw error;
      }

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
      
      // Parse and send suggestions to parent
      if (onSuggestionsUpdate && data.response) {
        const suggestions = parseAISuggestions(data.response);
        if (suggestions.length > 0) {
          onSuggestionsUpdate(suggestions);
          toast.success(`Found ${suggestions.length} product suggestions!`);
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
            Powered by Gemini
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        {/* Mode Selection */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'suggestions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('suggestions')}
            className="flex-1 gap-1"
          >
            <Lightbulb className="h-4 w-4" />
            Suggestions
          </Button>
          <Button
            variant={mode === 'recipes' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('recipes')}
            className="flex-1 gap-1"
          >
            <ChefHat className="h-4 w-4" />
            Recipes
          </Button>
          <Button
            variant={mode === 'chat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('chat')}
            className="flex-1 gap-1"
          >
            <ShoppingBag className="h-4 w-4" />
            Ask
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('shopping-suggestions')}
            disabled={isLoading}
            className="text-xs"
          >
            ✨ What am I missing?
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('recipe-ideas')}
            disabled={isLoading}
            className="text-xs"
          >
            🍳 Quick meal ideas
          </Button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder={
              mode === 'suggestions' ? "Ask about shopping tips, alternatives... (e.g., 'biryani ingredients')" :
              mode === 'recipes' ? "What kind of meal are you in the mood for?" :
              "Ask anything about groceries..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[60px] resize-none"
          />
          <Button 
            type="submit" 
            className="w-full gap-2"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Ask AI
              </>
            )}
          </Button>
        </form>

        {/* Response */}
        {(response || isLoading) && (
          <div className="p-4 rounded-xl bg-muted/50 space-y-2">
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
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