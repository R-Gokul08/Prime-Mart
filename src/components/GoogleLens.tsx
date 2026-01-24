import { useState, useRef } from 'react';
import { Camera, Scan, Loader2, X, Plus, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleLensProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: { name: string; category: string; price: number }) => void;
}

interface ScannedProduct {
  name: string;
  category: string;
  estimatedPrice: number;
  nutritionHighlights: string;
  storageTips: string;
}

export function GoogleLens({ open, onOpenChange, onAddItem }: GoogleLensProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setScannedProduct(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    try {
      // Extract base64 data from data URL
      const base64Data = imagePreview.split(',')[1];

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          type: 'lens-analyze',
          imageBase64: base64Data,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Parse the AI response to extract product info
      const response = data.response as string;
      
      // Simple parsing - in production you'd use structured output
      const product: ScannedProduct = {
        name: extractValue(response, 'Product name', 'Unknown Product'),
        category: extractValue(response, 'category', 'Grocery'),
        estimatedPrice: parseFloat(extractValue(response, 'price', '5.00').replace(/[^0-9.]/g, '')) || 5.00,
        nutritionHighlights: extractValue(response, 'Nutritional', 'Good source of nutrients'),
        storageTips: extractValue(response, 'Storage', 'Store in a cool, dry place'),
      };

      setScannedProduct(product);
      toast.success('Product analyzed successfully!');
    } catch (error) {
      console.error('Lens error:', error);
      toast.error('Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractValue = (text: string, key: string, fallback: string): string => {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes(key.toLowerCase())) {
        const parts = line.split(':');
        if (parts.length > 1) {
          return parts.slice(1).join(':').trim();
        }
      }
    }
    return fallback;
  };

  const handleAddToList = () => {
    if (!scannedProduct) return;
    
    onAddItem({
      name: scannedProduct.name,
      category: scannedProduct.category,
      price: scannedProduct.estimatedPrice,
    });
    
    toast.success(`${scannedProduct.name} added to your list!`);
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setImagePreview(null);
    setScannedProduct(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5 text-primary" />
            Smart Product Scanner
            <Badge variant="secondary" className="ml-2 text-xs">AI Powered</Badge>
          </DialogTitle>
          <DialogDescription>
            Take a photo or upload an image of a product to analyze and add it to your list
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload Area */}
          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Upload Product Image</p>
                  <p className="text-sm text-muted-foreground">Click to select or take a photo</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-full h-48 object-cover rounded-xl"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleReset}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Analyze Button */}
          {imagePreview && !scannedProduct && (
            <Button
              onClick={analyzeImage}
              disabled={isAnalyzing}
              className="w-full gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4" />
                  Analyze Product
                </>
              )}
            </Button>
          )}

          {/* Scanned Product Result */}
          {scannedProduct && (
            <Card className="p-4 space-y-3 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{scannedProduct.name}</h3>
                  <Badge variant="secondary">{scannedProduct.category}</Badge>
                </div>
                <span className="text-xl font-bold text-primary">
                  ${scannedProduct.estimatedPrice.toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">🥗 Nutrition: </span>
                  <span className="text-muted-foreground">{scannedProduct.nutritionHighlights}</span>
                </div>
                <div>
                  <span className="font-medium">📦 Storage: </span>
                  <span className="text-muted-foreground">{scannedProduct.storageTips}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={handleReset}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Scan Another
                </Button>
                <Button className="flex-1" onClick={handleAddToList}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to List
                </Button>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}