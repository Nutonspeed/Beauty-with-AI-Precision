'use client';

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TutorialButtonProps {
  onClick: () => void;
  className?: string;
}

export function TutorialButton({ onClick, className }: TutorialButtonProps) {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onClick}
      className={`shadow-lg hover:shadow-xl transition-all ${className}`}
      title="ดูคู่มือการใช้งาน"
    >
      <HelpCircle className="h-4 w-4 mr-2" />
      ดูคู่มือ
    </Button>
  );
}
