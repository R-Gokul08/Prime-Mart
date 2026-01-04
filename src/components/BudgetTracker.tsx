import { Wallet, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Budget } from '@/types/grocery';

interface BudgetTrackerProps {
  budget: Budget;
  currentSpend: number;
}

export function BudgetTracker({ budget, currentSpend }: BudgetTrackerProps) {
  const percentage = Math.min((currentSpend / budget.total) * 100, 100);
  const isOverBudget = currentSpend > budget.total;
  const remaining = budget.total - currentSpend;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Budget Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Weekly Budget</p>
            <p className="text-2xl font-bold">${budget.total.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Spend</p>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-foreground'}`}>
              ${currentSpend.toFixed(2)}
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
                    ${Math.abs(remaining).toFixed(2)} over
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-success" />
                  <span className="text-success font-medium">
                    ${remaining.toFixed(2)} left
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
