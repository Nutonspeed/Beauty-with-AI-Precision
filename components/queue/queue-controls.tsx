/**
 * Queue Controls Component
 * Actions for managing the queue
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { PhoneCall, Play, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface QueueControlsProps {
  onCallNext?: () => void;
  onCallPatient?: (entryId: string) => void;
  onStartService?: (entryId: string) => void;
  onCompleteService?: (entryId: string) => void;
  onCancelEntry?: (entryId: string) => void;
  onMarkNoShow?: (entryId: string) => void;
  entryId?: string;
  status?: string;
  className?: string;
}

export function QueueControls({
  onCallNext,
  onCallPatient,
  onStartService,
  onCompleteService,
  onCancelEntry,
  onMarkNoShow,
  entryId,
  status,
  className = ''
}: QueueControlsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {/* Call Next - Show when no specific entry */}
      {!entryId && onCallNext && (
        <Button onClick={onCallNext} className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4" />
          Call Next
        </Button>
      )}

      {/* Call Specific Patient */}
      {entryId && status === 'waiting' && onCallPatient && (
        <Button onClick={() => onCallPatient(entryId)} variant="outline" className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4" />
          Call
        </Button>
      )}

      {/* Start Service */}
      {entryId && status === 'called' && onStartService && (
        <Button onClick={() => onStartService(entryId)} variant="outline" className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          Start Service
        </Button>
      )}

      {/* Complete Service */}
      {entryId && status === 'in-service' && onCompleteService && (
        <Button onClick={() => onCompleteService(entryId)} variant="outline" className="flex items-center gap-2 text-green-600 hover:text-green-700">
          <CheckCircle2 className="w-4 h-4" />
          Complete
        </Button>
      )}

      {/* Cancel */}
      {entryId && (status === 'waiting' || status === 'called') && onCancelEntry && (
        <Button onClick={() => onCancelEntry(entryId)} variant="outline" className="flex items-center gap-2 text-red-600 hover:text-red-700">
          <XCircle className="w-4 h-4" />
          Cancel
        </Button>
      )}

      {/* Mark No Show */}
      {entryId && status === 'called' && onMarkNoShow && (
        <Button onClick={() => onMarkNoShow(entryId)} variant="outline" className="flex items-center gap-2 text-orange-600 hover:text-orange-700">
          <AlertCircle className="w-4 h-4" />
          No Show
        </Button>
      )}
    </div>
  );
}
