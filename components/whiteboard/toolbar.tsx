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
  Upload,
  Lock,
  Unlock
} from 'lucide-react';

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
  className = ''
}: ToolbarProps) {
  return (
    <div className={`flex flex-col gap-4 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg ${className}`}>
      {/* Tools */}
      <div>
        <Label className="mb-2 block text-sm font-semibold">Tools</Label>
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
        <Label className="mb-2 block text-sm font-semibold">Color</Label>
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
          {isLocked ? 'Unlock Board' : 'Lock Board'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={!canDraw}
          className="w-full justify-start text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportImage}
          className="w-full justify-start"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PNG
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportJSON}
          className="w-full justify-start"
        >
          <Download className="w-4 h-4 mr-2" />
          Export JSON
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onImportJSON}
          className="w-full justify-start"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import JSON
        </Button>
      </div>
    </div>
  );
}
