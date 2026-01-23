import { WifiOff, Wifi, CloudOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  isOnline: boolean;
  className?: string;
}

export function OfflineIndicator({ isOnline, className }: OfflineIndicatorProps) {
  return (
    <Badge
      variant={isOnline ? "outline" : "destructive"}
      className={cn(
        "gap-1 transition-all duration-300",
        isOnline && "bg-green-500/10 text-green-600 border-green-500/20",
        className
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3" />
          <span className="hidden sm:inline">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          <span className="hidden sm:inline">Offline</span>
          <CloudOff className="h-3 w-3 ml-1" />
        </>
      )}
    </Badge>
  );
}
