import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InventoryItem } from '@/types/grocery';

interface DuplicateAlertProps {
  existingItem: InventoryItem;
  onConfirmAdd: () => void;
  onCancel: () => void;
}

export function DuplicateAlert({ existingItem, onConfirmAdd, onCancel }: DuplicateAlertProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Possible Duplicate</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          You already have <strong>{existingItem.name}</strong> in your inventory 
          ({existingItem.currentStock} {existingItem.unit} in stock).
        </p>
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={onConfirmAdd}>
            Add Anyway
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
