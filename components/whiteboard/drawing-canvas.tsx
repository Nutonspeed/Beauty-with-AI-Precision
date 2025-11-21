/**
 * Drawing Canvas Component
 * Main canvas for collaborative drawing
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { DrawingElement, UserCursor, Point } from '@/lib/whiteboard-manager';

interface DrawingCanvasProps {
  elements: DrawingElement[];
  activeUsers: UserCursor[];
  onMouseMove?: (x: number, y: number) => void;
  onMouseDown?: (x: number, y: number) => void;
  onMouseUp?: (x: number, y: number) => void;
  width?: number;
  height?: number;
  className?: string;
}

export function DrawingCanvas({
  elements,
  activeUsers,
  onMouseMove,
  onMouseDown,
  onMouseUp,
  width = 1200,
  height = 800,
  className = ''
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Draw a single element
   */
  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.strokeStyle = element.color;
    ctx.fillStyle = element.color;
    ctx.lineWidth = element.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (element.type) {
      case 'pen':
      case 'eraser':
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
          if (element.type === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
          } else {
            ctx.stroke();
          }
        }
        break;

      case 'line':
        if (element.x !== undefined && element.y !== undefined &&
            element.width_shape !== undefined && element.height !== undefined) {
          ctx.beginPath();
          ctx.moveTo(element.x, element.y);
          ctx.lineTo(element.x + element.width_shape, element.y + element.height);
          ctx.stroke();
        }
        break;

      case 'rectangle':
        if (element.x !== undefined && element.y !== undefined &&
            element.width_shape !== undefined && element.height !== undefined) {
          ctx.strokeRect(element.x, element.y, element.width_shape, element.height);
        }
        break;

      case 'circle':
        if (element.x !== undefined && element.y !== undefined &&
            element.width_shape !== undefined && element.height !== undefined) {
          const centerX = element.x + element.width_shape / 2;
          const centerY = element.y + element.height / 2;
          const radiusX = Math.abs(element.width_shape / 2);
          const radiusY = Math.abs(element.height / 2);
          
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;

      case 'text':
        if (element.x !== undefined && element.y !== undefined && element.text) {
          ctx.font = `${element.fontSize || 16}px Arial`;
          ctx.fillText(element.text, element.x, element.y);
        }
        break;
    }
  };

  /**
   * Draw user cursor
   */
  const drawCursor = (ctx: CanvasRenderingContext2D, user: UserCursor) => {
    // Draw cursor circle
    ctx.fillStyle = user.color;
    ctx.beginPath();
    ctx.arc(user.x, user.y, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Draw user name
    ctx.font = '12px Arial';
    ctx.fillStyle = user.color;
    ctx.fillText(user.userName, user.x + 10, user.y - 10);
  };

  // Draw elements on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw all elements
    for (const element of elements) {
      drawElement(ctx, element);
    }

    // Draw user cursors
    for (const user of activeUsers) {
      drawCursor(ctx, user);
    }
  }, [elements, activeUsers, width, height]);

  /**
   * Get mouse position relative to canvas
   */
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  /**
   * Handle mouse down
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    if (onMouseDown) {
      onMouseDown(pos.x, pos.y);
    }
  };

  /**
   * Handle mouse move
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    if (onMouseMove) {
      onMouseMove(pos.x, pos.y);
    }
  };

  /**
   * Handle mouse up
   */
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    if (onMouseUp) {
      onMouseUp(pos.x, pos.y);
    }
  };

  /**
   * Handle mouse leave
   */
  const handleMouseLeave = () => {
    // intentionally left blank; consumers can handle leave via onMouseUp
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 cursor-crosshair ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
}
