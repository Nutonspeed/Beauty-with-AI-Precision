/**
 * Schedule Controls Component
 * Controls for schedule generation and management
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Calendar, Plus, Trash2 } from 'lucide-react';

interface ScheduleControlsProps {
  onGenerate: (config: {
    date: string;
    providerId: string;
    workingHours: { start: string; end: string };
    slotDuration: number;
    breakTimes?: Array<{ start: string; end: string }>;
  }) => void;
  className?: string;
}

export function ScheduleControls({ onGenerate, className }: ScheduleControlsProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [providerId, setProviderId] = useState('provider-1');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState('30');
  const [breakTimes, setBreakTimes] = useState<Array<{ start: string; end: string }>>([
    { start: '12:00', end: '13:00' }
  ]);

  const handleAddBreak = () => {
    setBreakTimes([...breakTimes, { start: '12:00', end: '13:00' }]);
  };

  const handleRemoveBreak = (index: number) => {
    setBreakTimes(breakTimes.filter((_, i) => i !== index));
  };

  const handleUpdateBreak = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...breakTimes];
    updated[index][field] = value;
    setBreakTimes(updated);
  };

  const handleGenerate = () => {
    onGenerate({
      date,
      providerId,
      workingHours: { start: startTime, end: endTime },
      slotDuration: parseInt(slotDuration),
      breakTimes: breakTimes.length > 0 ? breakTimes : undefined
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Schedule Configuration
        </CardTitle>
        <CardDescription>
          Set up working hours and generate time slots
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Provider ID */}
        <div className="space-y-2">
          <Label htmlFor="providerId">Provider ID</Label>
          <Input
            id="providerId"
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            placeholder="provider-1"
          />
        </div>

        {/* Working Hours */}
        <div className="space-y-2">
          <Label>Working Hours</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="startTime" className="text-xs text-gray-600 dark:text-gray-400">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime" className="text-xs text-gray-600 dark:text-gray-400">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Slot Duration */}
        <div className="space-y-2">
          <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
          <Input
            id="slotDuration"
            type="number"
            min="15"
            step="15"
            value={slotDuration}
            onChange={(e) => setSlotDuration(e.target.value)}
          />
        </div>

        {/* Break Times */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Break Times</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddBreak}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Break
            </Button>
          </div>
          <div className="space-y-2">
            {breakTimes.map((breakTime, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="time"
                  value={breakTime.start}
                  onChange={(e) => handleUpdateBreak(index, 'start', e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="time"
                  value={breakTime.end}
                  onChange={(e) => handleUpdateBreak(index, 'end', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveBreak(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Generate Schedule
        </Button>
      </CardContent>
    </Card>
  );
}
