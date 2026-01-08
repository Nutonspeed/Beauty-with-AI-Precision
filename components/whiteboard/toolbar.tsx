/**
 * Whiteboard Toolbar Component
 * Tool selection and settings
 */

import React from 'react';
import { DrawingTool, DrawingColor } from '@/lib/whiteboard-manager';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Pencil,
  Eraser,
  Minus,
  Square,
  Circle,
  Type,
  MousePointer2,
  Trash2,
  Download,
  Lock,
  Unlock,
  Undo2,
  Redo2
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ToolbarProps {
  currentTool: DrawingTool;
  currentColor: DrawingColor;
  currentWidth: number;
  isLocked: boolean;
  canDraw: boolean;
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: DrawingColor) => void;
  onWidthChange: (width: number) => void;
  onClear?: () => void;
  onExportImage?: () => void;
  onExportJSON?: () => void;
  onImportJSON?: () => void;
  onToggleLock?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  className?: string;
}

// Define the Icon component props interface
interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

type IconComponent = React.ComponentType<IconProps>;

const tools: { type: DrawingTool; icon: IconComponent; label: string }[] = [
  { type: 'pen', icon: Pencil, label: 'Pen' },
  { type: 'eraser', icon: Eraser, label: 'Eraser' },
  { type: 'line', icon: Minus, label: 'Line' },
  { type: 'rectangle', icon: Square, label: 'Rectangle' },
  { type: 'circle', icon: Circle, label: 'Circle' },
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'select', icon: MousePointer2, label: 'Select' }
];

const colors: { value: DrawingColor; hex: string; label: string }[] = [
  { value: 'black', hex: '#000000', label: 'Black' },
  { value: 'red', hex: '#EF4444', label: 'Red' },
  { value: 'blue', hex: '#3B82F6', label: 'Blue' },
  { value: 'green', hex: '#10B981', label: 'Green' },
  { value: 'yellow', hex: '#F59E0B', label: 'Yellow' },
  { value: 'orange', hex: '#F97316', label: 'Orange' },
  { value: 'purple', hex: '#8B5CF6', label: 'Purple' }
];

const widths = [1, 2, 4, 6, 8];

export function Toolbar({
  currentTool,
  currentColor,
  currentWidth,
  isLocked,
  canDraw,
  onToolChange,
  onColorChange,
  onWidthChange,
  onClear,
  onExportImage,
  onExportJSON,
  onImportJSON,
  onToggleLock,
  onUndo,
  onRedo,
  className = ''
}: ToolbarProps) {
  const t = useTranslations();

  const tools: { type: DrawingTool; icon: IconComponent; label: string }[] = [
    { type: 'pen', icon: Pencil, label: t('whiteboard.tools.pencil') },
    { type: 'eraser', icon: Eraser, label: t('whiteboard.tools.eraser') },
    { type: 'line', icon: Minus, label: t('whiteboard.tools.line') },
    { type: 'rectangle', icon: Square, label: t('whiteboard.tools.rectangle') },
    { type: 'circle', icon: Circle, label: t('whiteboard.tools.circle') },
    { type: 'text', icon: Type, label: t('whiteboard.tools.text') },
    { type: 'select', icon: MousePointer2, label: t('whiteboard.tools.select') },
  ];

  const colors: { value: DrawingColor; hex: string; label: string }[] = [
    { value: 'black', hex: '#000000', label: t('whiteboard.colors.black') },
    { value: 'red', hex: '#ef4444', label: t('whiteboard.colors.red') },
    { value: 'green', hex: '#22c55e', label: t('whiteboard.colors.green') },
    { value: 'blue', hex: '#3b82f6', label: t('whiteboard.colors.blue') },
    { value: 'yellow', hex: '#eab308', label: t('whiteboard.colors.yellow') },
    { value: '#a855f7' as DrawingColor, hex: '#a855f7', label: t('whiteboard.colors.purple') },
    { value: '#f97316' as DrawingColor, hex: '#f97316', label: t('whiteboard.colors.orange') },
  ];

  return (
    <div className={`flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg ${className}`}>
      {/* Tools */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">{t('whiteboard.tools.label')}</Label>
        <div className="grid grid-cols-4 gap-2">
          {tools.map(({ type, icon: Icon, label }) => (
            <Button
              key={type}
              variant={currentTool === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange(type)}
              disabled={!canDraw && type !== 'select'}
              className="flex-col h-16 gap-1"
              title={label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">{t('whiteboard.colors.label')}</Label>
        <div className="grid grid-cols-7 gap-2">
          {colors.map(({ value, hex, label }) => (
            <button
              key={value}
              onClick={() => onColorChange(value)}
              disabled={!canDraw}
              className={`
                w-8 h-8 rounded-full border-2 transition-all
                ${currentColor === value ? 'border-gray-900 dark:border-gray-100 scale-110' : 'border-gray-300 dark:border-gray-600'}
                ${!canDraw ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
              `}
              style={{ backgroundColor: hex }}
              title={label}
            />
          ))}
        </div>
      </div>

      {/* Width */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">Width: {currentWidth}px</Label>
        <div className="flex gap-2">
          {widths.map(width => (
            <button
              key={width}
              onClick={() => onWidthChange(width)}
              disabled={!canDraw}
              className={`
                flex items-center justify-center w-10 h-10 rounded border transition-all
                ${currentWidth === width ? 'border-gray-900 dark:border-gray-100 bg-gray-200 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600'}
                ${!canDraw ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
              `}
            >
              <div
                className="rounded-full bg-gray-900 dark:bg-gray-100"
                style={{ width: `${width * 2}px`, height: `${width * 2}px` }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleLock}
          className="w-full justify-start"
        >
          {isLocked ? <Unlock className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
          {isLocked ? t('whiteboard.actions.unlock') : t('whiteboard.actions.lock')}
        </Button>

        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" onClick={onUndo} className="justify-start gap-2">
            <Undo2 className="h-4 w-4" />
            {t('whiteboard.actions.undo')}
          </Button>
          <Button variant="outline" size="sm" onClick={onRedo} className="justify-start gap-2">
            <Redo2 className="h-4 w-4" />
            {t('whiteboard.actions.redo')}
          </Button>
          <div className="h-px bg-border my-1" />
          <Button variant="outline" size="sm" onClick={onExportImage} className="justify-start gap-2">
            <Download className="h-4 w-4" />
            {t('whiteboard.actions.export')}
          </Button>
          <Button variant="destructive" size="sm" onClick={onClear} disabled={isLocked && !canDraw} className="justify-start gap-2">
            <Trash2 className="h-4 w-4" />
            {t('whiteboard.actions.clear')}
          </Button>
        </div>
      </div>
    </div>
  );
}
