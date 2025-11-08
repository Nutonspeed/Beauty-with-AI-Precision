"use client";

import { useWebSocketConnection } from '@/hooks/useWebSocketConnection';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'badge' | 'icon' | 'full';
}

function getStatus(isConnecting: boolean, isReady: boolean): 'connecting' | 'connected' | 'disconnected' {
  if (isReady) return 'connected';
  if (isConnecting) return 'connecting';
  return 'disconnected';
}

export function ConnectionStatusIndicator({
  className,
  showLabel = true,
  variant = 'badge'
}: ConnectionStatusIndicatorProps) {
  const { isReady, isConnecting } = useWebSocketConnection();
  const status = getStatus(isConnecting, isReady);

  // Variant: icon only
  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center', className)}>
        {status === 'connected' && (
          <Wifi className="h-4 w-4 text-green-600" />
        )}
        {status === 'connecting' && (
          <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
        )}
        {status === 'disconnected' && (
          <WifiOff className="h-4 w-4 text-red-600" />
        )}
      </div>
    );
  }

  // Variant: badge
  if (variant === 'badge') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'flex items-center gap-1.5 px-2 py-1',
          status === 'connected' && 'bg-green-50 text-green-700 border-green-200',
          status === 'connecting' && 'bg-yellow-50 text-yellow-700 border-yellow-200',
          status === 'disconnected' && 'bg-red-50 text-red-700 border-red-200',
          className
        )}
      >
        {status === 'connected' && <Wifi className="h-3 w-3" />}
        {status === 'connecting' && <Loader2 className="h-3 w-3 animate-spin" />}
        {status === 'disconnected' && <WifiOff className="h-3 w-3" />}
        {showLabel && (
          <span className="text-xs font-medium">
            {status === 'connected' && 'Connected'}
            {status === 'connecting' && 'Connecting...'}
            {status === 'disconnected' && 'Disconnected'}
          </span>
        )}
      </Badge>
    );
  }

  // Variant: full (with detailed message)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1.5">
        {status === 'connected' && <Wifi className="h-4 w-4 text-green-600" />}
        {status === 'connecting' && <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />}
        {status === 'disconnected' && <WifiOff className="h-4 w-4 text-red-600" />}
        
        {showLabel && (
          <span
            className={cn(
              'text-sm font-medium',
              status === 'connected' && 'text-green-700',
              status === 'connecting' && 'text-yellow-700',
              status === 'disconnected' && 'text-red-700'
            )}
          >
            {status === 'connected' && 'Real-time Connected'}
            {status === 'connecting' && 'Connecting to server...'}
            {status === 'disconnected' && 'Real-time Disconnected'}
          </span>
        )}
      </div>
    </div>
  );
}
