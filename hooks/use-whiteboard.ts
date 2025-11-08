/**
 * React hook for collaborative whiteboard
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  WhiteboardManager,
  DrawingElement,
  UserCursor,
  DrawingTool,
  DrawingColor,
  Point
} from '@/lib/whiteboard-manager';

interface UseWhiteboardProps {
  whiteboardId: string;
  userId: string;
  userName: string;
  enabled?: boolean;
}

export function useWhiteboard({
  whiteboardId,
  userId,
  userName,
  enabled = true
}: UseWhiteboardProps) {
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserCursor[]>([]);
  const [currentTool, setCurrentTool] = useState<DrawingTool>('pen');
  const [currentColor, setCurrentColor] = useState<DrawingColor>('black');
  const [currentWidth, setCurrentWidth] = useState<number>(2);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [canDraw, setCanDraw] = useState(true);

  const managerRef = useRef<WhiteboardManager | null>(null);
  const userUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize manager
  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new WhiteboardManager();
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
      }
      if (userUpdateIntervalRef.current) {
        clearInterval(userUpdateIntervalRef.current);
      }
    };
  }, []);

  // Join whiteboard
  useEffect(() => {
    if (enabled && managerRef.current) {
      managerRef.current.joinWhiteboard(whiteboardId, userId, userName, {
        onElementAdded: (element) => {
          updateElements();
        },
        onElementRemoved: () => {
          updateElements();
        },
        onElementUpdated: () => {
          updateElements();
        },
        onCursorMoved: () => {
          updateActiveUsers();
        },
        onUserJoined: () => {
          updateActiveUsers();
        },
        onUserLeft: () => {
          updateActiveUsers();
        },
        onWhiteboardCleared: () => {
          updateElements();
        },
        onWhiteboardLocked: (userId, userName) => {
          setIsLocked(true);
          setLockedBy(userId);
          updateCanDraw();
        },
        onWhiteboardUnlocked: () => {
          setIsLocked(false);
          setLockedBy(null);
          updateCanDraw();
        }
      });

      updateElements();
      updateActiveUsers();

      // Update active users periodically
      userUpdateIntervalRef.current = setInterval(() => {
        updateActiveUsers();
      }, 1000);
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.leaveWhiteboard();
      }
      if (userUpdateIntervalRef.current) {
        clearInterval(userUpdateIntervalRef.current);
      }
    };
  }, [whiteboardId, userId, userName, enabled]);

  /**
   * Update elements from manager
   */
  const updateElements = useCallback(() => {
    if (!managerRef.current) return;
    const allElements = managerRef.current.getAllElements();
    setElements(allElements);
  }, []);

  /**
   * Update active users
   */
  const updateActiveUsers = useCallback(() => {
    if (!managerRef.current) return;
    const users = managerRef.current.getActiveUsers();
    setActiveUsers(users);
  }, []);

  /**
   * Update canDraw state
   */
  const updateCanDraw = useCallback(() => {
    if (!managerRef.current) return;
    setCanDraw(managerRef.current.canDraw());
  }, []);

  /**
   * Add element
   */
  const addElement = useCallback((
    element: Omit<DrawingElement, 'id' | 'timestamp' | 'userId' | 'userName'>
  ): DrawingElement | null => {
    if (!managerRef.current || !canDraw) return null;
    const newElement = managerRef.current.addElement(element);
    updateElements();
    return newElement;
  }, [canDraw, updateElements]);

  /**
   * Remove element
   */
  const removeElement = useCallback((elementId: string) => {
    if (managerRef.current && canDraw) {
      managerRef.current.removeElement(elementId);
      updateElements();
    }
  }, [canDraw, updateElements]);

  /**
   * Update element
   */
  const updateElement = useCallback((
    elementId: string,
    updates: Partial<DrawingElement>
  ) => {
    if (managerRef.current && canDraw) {
      managerRef.current.updateElement(elementId, updates);
      updateElements();
    }
  }, [canDraw, updateElements]);

  /**
   * Clear whiteboard
   */
  const clearWhiteboard = useCallback(() => {
    if (managerRef.current && canDraw) {
      managerRef.current.clearWhiteboard();
      updateElements();
    }
  }, [canDraw, updateElements]);

  /**
   * Update cursor
   */
  const updateCursor = useCallback((x: number, y: number) => {
    if (managerRef.current) {
      managerRef.current.updateCursor(x, y);
    }
  }, []);

  /**
   * Lock whiteboard
   */
  const lockWhiteboard = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.lockWhiteboard();
      updateCanDraw();
    }
  }, [updateCanDraw]);

  /**
   * Unlock whiteboard
   */
  const unlockWhiteboard = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.unlockWhiteboard();
      updateCanDraw();
    }
  }, [updateCanDraw]);

  /**
   * Export as image
   */
  const exportAsImage = useCallback((canvas: HTMLCanvasElement): string => {
    if (!managerRef.current) return '';
    return managerRef.current.exportAsImage(canvas);
  }, []);

  /**
   * Export as JSON
   */
  const exportAsJSON = useCallback((): string => {
    if (!managerRef.current) return '';
    return managerRef.current.exportAsJSON();
  }, []);

  /**
   * Import from JSON
   */
  const importFromJSON = useCallback((json: string) => {
    if (managerRef.current) {
      managerRef.current.importFromJSON(json);
      updateElements();
    }
  }, [updateElements]);

  /**
   * Start drawing (pen/eraser)
   */
  const startDrawing = useCallback((x: number, y: number): DrawingElement | null => {
    if (!canDraw) return null;

    return addElement({
      type: currentTool,
      color: currentColor,
      width: currentWidth,
      points: [{ x, y }]
    });
  }, [canDraw, currentTool, currentColor, currentWidth, addElement]);

  /**
   * Continue drawing
   */
  const continueDrawing = useCallback((
    elementId: string,
    x: number,
    y: number
  ) => {
    const element = elements.find(e => e.id === elementId);
    if (element && element.points) {
      updateElement(elementId, {
        points: [...element.points, { x, y }]
      });
    }
  }, [elements, updateElement]);

  /**
   * Draw shape (line, rectangle, circle)
   */
  const drawShape = useCallback((
    type: 'line' | 'rectangle' | 'circle',
    x: number,
    y: number,
    width: number,
    height: number
  ): DrawingElement | null => {
    if (!canDraw) return null;

    return addElement({
      type,
      color: currentColor,
      width: currentWidth,
      x,
      y,
      width_shape: width,
      height
    });
  }, [canDraw, currentColor, currentWidth, addElement]);

  /**
   * Add text
   */
  const addText = useCallback((
    x: number,
    y: number,
    text: string,
    fontSize: number = 16
  ): DrawingElement | null => {
    if (!canDraw) return null;

    return addElement({
      type: 'text',
      color: currentColor,
      width: currentWidth,
      x,
      y,
      text,
      fontSize
    });
  }, [canDraw, currentColor, currentWidth, addElement]);

  return {
    // State
    elements,
    activeUsers,
    currentTool,
    currentColor,
    currentWidth,
    isLocked,
    lockedBy,
    canDraw,

    // Tool settings
    setCurrentTool,
    setCurrentColor,
    setCurrentWidth,

    // Drawing actions
    startDrawing,
    continueDrawing,
    drawShape,
    addText,
    removeElement,
    updateElement,
    clearWhiteboard,

    // Cursor
    updateCursor,

    // Lock
    lockWhiteboard,
    unlockWhiteboard,

    // Export/Import
    exportAsImage,
    exportAsJSON,
    importFromJSON
  };
}
