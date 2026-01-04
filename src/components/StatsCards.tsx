import { ShoppingBag, DollarSign, Heart, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatsCardsProps {
  stats: {
    totalItems: number;
    totalPrice: number;
    savings: number;
    healthyCount: number;
    dealsCount: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: ShoppingBag,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Estimated Cost',
      value: `$${stats.totalPrice.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-accent/10 text-accent',
    },
    {
      title: 'You Save',
      value: `$${stats.savings.toFixed(2)}`,
      icon: Tag,
      color: 'bg-deal/10 text-deal',
    },
    {
      title: 'Healthy Items',
      value: `${stats.healthyCount}/${stats.totalItems}`,
      icon: Heart,
      color: 'bg-healthy/10 text-healthy',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="p-4 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
