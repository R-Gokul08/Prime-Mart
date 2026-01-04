import { useState, useEffect } from 'react';
import { Plus, Mic, MicOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { categories, stores } from '@/data/mockData';
import { GroceryItem } from '@/types/grocery';

interface AddItemFormProps {
  onAddItem: (item: Omit<GroceryItem, 'id' | 'addedAt' | 'isChecked'>) => void;
}

export function AddItemForm({ onAddItem }: AddItemFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('pcs');
  const [price, setPrice] = useState('');
  const [store, setStore] = useState('');

  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useVoiceInput();

  useEffect(() => {
    if (transcript) {
      setName(prev => (prev + ' ' + transcript).trim());
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name: name.trim(),
      category: category || 'Pantry',
      quantity,
      unit,
      price: parseFloat(price) || 0,
      isHealthy: false,
      hasDeal: false,
      store: store || 'FreshMart',
    });

    // Reset form
    setName('');
    setCategory('');
    setQuantity(1);
    setUnit('pcs');
    setPrice('');
    setStore('');
    resetTranscript();
    setIsOpen(false);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="hero"
        size="lg"
        className="w-full gap-2"
      >
        <Plus className="h-5 w-5" />
        Add New Item
      </Button>
    );
  }

  return (
    <Card className="p-6 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Add New Item</h3>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              placeholder="Enter item name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pr-12"
            />
            {isSupported && (
              <Button
                type="button"
                variant={isListening ? "voiceActive" : "voice"}
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleVoiceToggle}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {isListening && (
          <div className="flex items-center gap-2 text-sm text-primary animate-pulse-soft">
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce-soft" />
            Listening... speak now
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={store} onValueChange={setStore}>
            <SelectTrigger>
              <SelectValue placeholder="Store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            type="number"
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min={1}
          />
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pcs">pcs</SelectItem>
              <SelectItem value="lb">lb</SelectItem>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="bunch">bunch</SelectItem>
              <SelectItem value="bag">bag</SelectItem>
              <SelectItem value="bottle">bottle</SelectItem>
              <SelectItem value="carton">carton</SelectItem>
              <SelectItem value="dozen">dozen</SelectItem>
              <SelectItem value="loaf">loaf</SelectItem>
              <SelectItem value="cups">cups</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            min={0}
          />
        </div>

        <Button type="submit" variant="hero" className="w-full">
          <Plus className="h-4 w-4" />
          Add to List
        </Button>
      </form>
    </Card>
  );
}
