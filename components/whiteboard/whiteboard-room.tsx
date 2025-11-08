/**
 * Whiteboard Room Component
 * Complete collaborative whiteboard interface
 */

'use client';

import React, { useState, useRef } from 'react';
import { useWhiteboard } from '@/hooks/use-whiteboard';
import { DrawingCanvas } from './drawing-canvas';
import { Toolbar } from './toolbar';
import { ActiveUsersPanel } from './active-users-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DrawingElement } from '@/lib/whiteboard-manager';
import { AlertCircle, Lock } from 'lucide-react';

interface WhiteboardRoomProps {
  whiteboardId: string;
  userId: string;
  userName: string;
  className?: string;
}

export function WhiteboardRoom({
  whiteboardId,
  userId,
  userName,
  className = ''
}: WhiteboardRoomProps) {
  const {
    elements,
    activeUsers,
    currentTool,
    currentColor,
    currentWidth,
    isLocked,
    lockedBy,
    canDraw,
    setCurrentTool,
    setCurrentColor,
    setCurrentWidth,
    startDrawing,
    continueDrawing,
    drawShape,
    addText,
    clearWhiteboard,
    updateCursor,
    lockWhiteboard,
    unlockWhiteboard,
    exportAsImage,
    exportAsJSON,
    importFromJSON
  } = useWhiteboard({
    whiteboardId,
    userId,
    userName,
    enabled: true
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentDrawingId, setCurrentDrawingId] = useState<string | null>(null);
  const [shapeStartPos, setShapeStartPos] = useState<{ x: number; y: number } | null>(null);

  /**
   * Handle mouse down
   */
  const handleMouseDown = (x: number, y: number) => {
    if (!canDraw) return;

    if (currentTool === 'pen' || currentTool === 'eraser') {
      const element = startDrawing(x, y);
      if (element) {
        setCurrentDrawingId(element.id);
      }
    } else if (currentTool === 'line' || currentTool === 'rectangle' || currentTool === 'circle') {
      setShapeStartPos({ x, y });
    } else if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        addText(x, y, text);
      }
    }
  };

  /**
   * Handle mouse move
   */
  const handleMouseMove = (x: number, y: number) => {
    updateCursor(x, y);

    if (!canDraw) return;

    if (currentDrawingId && (currentTool === 'pen' || currentTool === 'eraser')) {
      continueDrawing(currentDrawingId, x, y);
    }
  };

  /**
   * Handle mouse up
   */
  const handleMouseUp = (x: number, y: number) => {
    if (!canDraw) return;

    if (currentTool === 'pen' || currentTool === 'eraser') {
      setCurrentDrawingId(null);
    } else if (shapeStartPos && (currentTool === 'line' || currentTool === 'rectangle' || currentTool === 'circle')) {
      const width = x - shapeStartPos.x;
      const height = y - shapeStartPos.y;
      drawShape(currentTool, shapeStartPos.x, shapeStartPos.y, width, height);
      setShapeStartPos(null);
    }
  };

  /**
   * Handle export image
   */
  const handleExportImage = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const dataUrl = exportAsImage(canvas);
    const link = document.createElement('a');
    link.download = `whiteboard-${whiteboardId}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  /**
   * Handle export JSON
   */
  const handleExportJSON = () => {
    const json = exportAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `whiteboard-${whiteboardId}-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  /**
   * Handle import JSON
   */
  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const json = e.target?.result as string;
        if (json) {
          importFromJSON(json);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  /**
   * Handle toggle lock
   */
  const handleToggleLock = () => {
    if (isLocked) {
      unlockWhiteboard();
    } else {
      lockWhiteboard();
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-4 ${className}`}>
      {/* Left Toolbar */}
      <div className="order-2 lg:order-1">
        <Toolbar
          currentTool={currentTool}
          currentColor={currentColor}
          currentWidth={currentWidth}
          isLocked={isLocked}
          canDraw={canDraw}
          onToolChange={setCurrentTool}
          onColorChange={setCurrentColor}
          onWidthChange={setCurrentWidth}
          onClear={clearWhiteboard}
          onExportImage={handleExportImage}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
          onToggleLock={handleToggleLock}
        />
      </div>

      {/* Center Canvas */}
      <div className="order-1 lg:order-2 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Whiteboard</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{elements.length} elements</Badge>
                {isLocked && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Locked
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!canDraw && isLocked && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Whiteboard is locked. Only the person who locked it can draw.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="overflow-auto">
              <DrawingCanvas
                elements={elements}
                activeUsers={activeUsers}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                width={1200}
                height={800}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel */}
      <div className="order-3">
        <ActiveUsersPanel users={activeUsers} lockedBy={lockedBy} />
      </div>
    </div>
  );
}
