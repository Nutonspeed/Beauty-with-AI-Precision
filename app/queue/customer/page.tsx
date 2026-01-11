/**
 * Patient Queue View Page
 * Patient-facing queue ticket display
 */

'use client';

import React from 'react';
import { PatientQueueTicket } from '@/components/queue/patient-queue-ticket';

export default function PatientQueuePage() {
  // In a real app, this would come from auth
  const patientId = 'P001';
  const clinicId = 'clinic-1';

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Your Queue Status</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time updates on your appointment
        </p>
      </div>

      <PatientQueueTicket
        clinicId={clinicId}
        patientId={patientId}
      />
    </div>
  );
}
