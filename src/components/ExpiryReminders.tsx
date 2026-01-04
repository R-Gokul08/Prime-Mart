import { AlertTriangle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { expiringItems } from '@/data/mockData';

export function ExpiryReminders() {
  return (
    <Card className="animate-fade-in border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Expiring Soon
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {expiringItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl bg-card"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </div>
              <Badge variant={item.daysLeft <= 2 ? "destructive" : "warning"} className="gap-1">
                <Clock className="h-3 w-3" />
                {item.daysLeft} days
              </Badge>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Use these items soon to reduce food waste 🌱
        </p>
      </CardContent>
    </Card>
  );
}
