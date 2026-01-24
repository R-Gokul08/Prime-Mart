import { useState } from 'react';
import { Wallet, TrendingDown, TrendingUp, Edit2, Check, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Budget } from '@/types/grocery';
import { formatPrice, CURRENCY_SYMBOL } from '@/lib/currency';

interface BudgetTrackerProps {
  budget: Budget;
  currentSpend: number;
  onUpdateBudget?: (newTotal: number) => void;
}

export function BudgetTracker({ budget, currentSpend, onUpdateBudget }: BudgetTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.total.toString());
  
  const percentage = Math.min((currentSpend / budget.total) * 100, 100);
  const isOverBudget = currentSpend > budget.total;
  const remaining = budget.total - currentSpend;

  const handleSaveBudget = () => {
    const value = parseFloat(newBudget);
    if (!isNaN(value) && value > 0 && onUpdateBudget) {
      onUpdateBudget(value);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setNewBudget(budget.total.toString());
    setIsEditing(false);
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wallet className="h-5 w-5 text-primary" />
            Budget Tracker
          </CardTitle>
          {!isEditing && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Change Budget
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-3 p-4 bg-secondary/30 rounded-xl border border-border">
            <p className="text-sm font-medium text-foreground">Set your weekly budget</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{CURRENCY_SYMBOL}</span>
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                min="1"
                step="100"
                className="flex-1"
                placeholder="Enter amount"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveBudget} size="sm" className="flex-1 gap-1">
                <Check className="h-4 w-4" />
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1 gap-1">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Budget</p>
                <p className="text-2xl font-bold">{formatPrice(budget.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Current Spend</p>
                <p className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
                  {formatPrice(currentSpend)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Progress 
                value={percentage} 
                className={`h-3 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{percentage.toFixed(0)}% used</span>
                <div className="flex items-center gap-1">
                  {isOverBudget ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-destructive" />
                      <span className="text-destructive font-medium">
                        {formatPrice(Math.abs(remaining))} over
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-success" />
                      <span className="text-success font-medium">
                        {formatPrice(remaining)} left
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
