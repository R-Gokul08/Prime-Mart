import { ShoppingCart, Bell, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OfflineIndicator } from './OfflineIndicator';

interface HeaderProps {
  notificationCount?: number;
  isOnline?: boolean;
  onUserClick?: () => void;
}

export function Header({ notificationCount = 3, isOnline = true, onUserClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">SmartCart</h1>
            <p className="text-xs text-muted-foreground">Shop Smarter</p>
          </div>
        </div>

        <div className="hidden flex-1 max-w-md mx-8 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search groceries..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OfflineIndicator isOnline={isOnline} />
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge variant="deal" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                {notificationCount}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={onUserClick}>
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
