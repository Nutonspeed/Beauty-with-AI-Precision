/**
 * Client Queue View Page
 * Client-facing queue ticket display
 */

'use client';

import React from 'react';
import { CustomerQueueTicket as ClientQueueTicket } from '@/components/queue/customer-queue-ticket';

export default function ClientQueuePage() {
  // In a real app, this would come from auth
  const clientId = 'P001';
  const centerId = 'center-1';

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Your Queue Status</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time updates on your appointment
        </p>
      </div>

      <ClientQueueTicket
        centerId={centerId}
        clientId={clientId}
      />
    </div>
  );
}
