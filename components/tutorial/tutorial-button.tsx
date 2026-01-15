'use client';

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface TutorialButtonProps {
  onClick: () => void;
  className?: string;
}

export function TutorialButton({ onClick, className }: TutorialButtonProps) {
  const t = useTranslations('tutorial.button')
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("fixed bottom-20 right-4 z-50 rounded-full shadow-lg gap-2", className)}
      title={t('title')}
      onClick={onClick}
    >
      <HelpCircle className="h-4 w-4" />
      {t('label')}
    </Button>
  )
}
