import { useState } from 'react';
import { Sparkles, Send, Loader2, ChefHat, ShoppingBag, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GroceryItem } from '@/types/grocery';

interface AIAssistantProps {
  groceryItems: GroceryItem[];
}

type AssistantMode = 'suggestions' | 'recipes' | 'chat';

export function AIAssistant({ groceryItems }: AIAssistantProps) {
  const [mode, setMode] = useState<AssistantMode>('suggestions');
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getAIResponse = async (type: string, context?: string) => {
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
    } catch (error) {
      console.error('AI error:', error);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

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
              mode === 'suggestions' ? "Ask about shopping tips, alternatives..." :
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