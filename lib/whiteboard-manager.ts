/**
 * Whiteboard Manager
 * Real-time collaborative whiteboard for medical diagrams
 */

import wsClient, { type WebSocketClient } from './websocket-client';

export type DrawingTool = 'pen' | 'eraser' | 'line' | 'rectangle' | 'circle' | 'text' | 'select';
export type DrawingColor = 'black' | 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple';

export interface Point {
  x: number;
  y: number;
}

export interface DrawingElement {
  id: string;
  type: DrawingTool;
  color: DrawingColor;
  width: number;
  points?: Point[];
  x?: number;
  y?: number;
  width_shape?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  timestamp: number;
  userId: string;
  userName: string;
}

export interface WhiteboardState {
  elements: Map<string, DrawingElement>;
  users: Map<string, UserCursor>;
  isLocked: boolean;
  lockedBy: string | null;
}

export interface UserCursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
  lastUpdate: number;
}

export interface WhiteboardEventHandlers {
  onElementAdded?: (element: DrawingElement) => void;
  onElementRemoved?: (elementId: string) => void;
  onElementUpdated?: (element: DrawingElement) => void;
  onCursorMoved?: (cursor: UserCursor) => void;
  onUserJoined?: (userId: string, userName: string) => void;
  onUserLeft?: (userId: string) => void;
  onWhiteboardCleared?: () => void;
  onWhiteboardLocked?: (userId: string, userName: string) => void;
  onWhiteboardUnlocked?: () => void;
}

export class WhiteboardManager {
  private wsClient: WebSocketClient;
  private whiteboardId: string | null = null;
  private userId: string | null = null;
  private userName: string | null = null;
  private state: WhiteboardState = {
    elements: new Map(),
    users: new Map(),
    isLocked: false,
    lockedBy: null
  };
  private handlers: WhiteboardEventHandlers = {};
  private cursorUpdateTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.wsClient = wsClient;
  }

  /**
   * Join a whiteboard session
   */
  joinWhiteboard(
    whiteboardId: string,
    userId: string,
    userName: string,
    handlers: WhiteboardEventHandlers
  ): void {
    this.whiteboardId = whiteboardId;
    this.userId = userId;
    this.userName = userName;
    this.handlers = handlers;

    // Send join message
    this.wsClient.send('whiteboard_join', {
      whiteboardId,
      userId,
      userName,
      timestamp: Date.now()
    });

    console.log(`[Whiteboard] Joined: ${whiteboardId}`);
  }

  /**
   * Add a drawing element
   */
  addElement(element: Omit<DrawingElement, 'id' | 'timestamp' | 'userId' | 'userName'>): DrawingElement {
    const newElement: DrawingElement = {
      id: `elem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...element,
      timestamp: Date.now(),
      userId: this.userId!,
      userName: this.userName!
    };

    this.state.elements.set(newElement.id, newElement);

    // Broadcast to other users
    this.wsClient.send('whiteboard_element_add', {
      whiteboardId: this.whiteboardId,
      element: newElement
    });

    // Call handler
    if (this.handlers.onElementAdded) {
      this.handlers.onElementAdded(newElement);
    }

    return newElement;
  }

  /**
   * Remove a drawing element
   */
  removeElement(elementId: string): void {
    if (this.state.elements.delete(elementId)) {
      // Broadcast to other users
      this.wsClient.send('whiteboard_element_remove', {
        whiteboardId: this.whiteboardId,
        elementId,
        userId: this.userId
      });

      // Call handler
      if (this.handlers.onElementRemoved) {
        this.handlers.onElementRemoved(elementId);
      }
    }
  }

  /**
   * Update a drawing element
   */
  updateElement(elementId: string, updates: Partial<DrawingElement>): void {
    const element = this.state.elements.get(elementId);
    if (element) {
      const updated = { ...element, ...updates, timestamp: Date.now() };
      this.state.elements.set(elementId, updated);

      // Broadcast to other users
      this.wsClient.send('whiteboard_element_update', {
        whiteboardId: this.whiteboardId,
        element: updated
      });

      // Call handler
      if (this.handlers.onElementUpdated) {
        this.handlers.onElementUpdated(updated);
      }
    }
  }

  /**
   * Clear all elements
   */
  clearWhiteboard(): void {
    this.state.elements.clear();

    // Broadcast to other users
    this.wsClient.send('whiteboard_clear', {
      whiteboardId: this.whiteboardId,
      userId: this.userId,
      timestamp: Date.now()
    });

    // Call handler
    if (this.handlers.onWhiteboardCleared) {
      this.handlers.onWhiteboardCleared();
    }

    console.log('[Whiteboard] Cleared');
  }

  /**
   * Update cursor position
   */
  updateCursor(x: number, y: number): void {
    const cursor: UserCursor = {
      userId: this.userId!,
      userName: this.userName!,
      x,
      y,
      color: this.getUserColor(this.userId!),
      lastUpdate: Date.now()
    };

    this.state.users.set(this.userId!, cursor);

    // Throttle cursor updates
    if (!this.cursorUpdateTimer) {
      this.cursorUpdateTimer = setTimeout(() => {
        this.wsClient.send('whiteboard_cursor_move', {
          whiteboardId: this.whiteboardId,
          cursor
        });
        this.cursorUpdateTimer = null;
      }, 50); // 20 updates per second
    }
  }

  /**
   * Lock whiteboard (only one user can draw)
   */
  lockWhiteboard(): void {
    if (!this.state.isLocked) {
      this.state.isLocked = true;
      this.state.lockedBy = this.userId;

      this.wsClient.send('whiteboard_lock', {
        whiteboardId: this.whiteboardId,
        userId: this.userId,
        userName: this.userName,
        timestamp: Date.now()
      });

      if (this.handlers.onWhiteboardLocked) {
        this.handlers.onWhiteboardLocked(this.userId!, this.userName!);
      }
    }
  }

  /**
   * Unlock whiteboard
   */
  unlockWhiteboard(): void {
    if (this.state.isLocked && this.state.lockedBy === this.userId) {
      this.state.isLocked = false;
      this.state.lockedBy = null;

      this.wsClient.send('whiteboard_unlock', {
        whiteboardId: this.whiteboardId,
        userId: this.userId,
        timestamp: Date.now()
      });

      if (this.handlers.onWhiteboardUnlocked) {
        this.handlers.onWhiteboardUnlocked();
      }
    }
  }

  /**
   * Export whiteboard as image
   */
  exportAsImage(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png');
  }

  /**
   * Export whiteboard as JSON
   */
  exportAsJSON(): string {
    const data = {
      whiteboardId: this.whiteboardId,
      elements: Array.from(this.state.elements.values()),
      exportedAt: Date.now()
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import whiteboard from JSON
   */
  importFromJSON(json: string): void {
    try {
      const data = JSON.parse(json);
      if (data.elements && Array.isArray(data.elements)) {
        this.clearWhiteboard();
        for (const element of data.elements) {
          this.state.elements.set(element.id, element);
          if (this.handlers.onElementAdded) {
            this.handlers.onElementAdded(element);
          }
        }
      }
    } catch (error) {
      console.error('[Whiteboard] Import error:', error);
    }
  }

  /**
   * Get all elements
   */
  getAllElements(): DrawingElement[] {
    return Array.from(this.state.elements.values())
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get active users
   */
  getActiveUsers(): UserCursor[] {
    const now = Date.now();
    return Array.from(this.state.users.values())
      .filter(user => now - user.lastUpdate < 5000) // Active in last 5 seconds
      .filter(user => user.userId !== this.userId); // Exclude self
  }

  /**
   * Get whiteboard state
   */
  getState(): WhiteboardState {
    return { ...this.state };
  }

  /**
   * Check if user can draw
   */
  canDraw(): boolean {
    return !this.state.isLocked || this.state.lockedBy === this.userId;
  }

  /**
   * Get user color (deterministic based on userId)
   */
  private getUserColor(userId: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  /**
   * Leave whiteboard
   */
  leaveWhiteboard(): void {
    if (this.whiteboardId && this.userId) {
      this.wsClient.send('whiteboard_leave', {
        whiteboardId: this.whiteboardId,
        userId: this.userId,
        timestamp: Date.now()
      });

      if (this.cursorUpdateTimer) {
        clearTimeout(this.cursorUpdateTimer);
        this.cursorUpdateTimer = null;
      }

      this.state.elements.clear();
      this.state.users.clear();
      this.state.isLocked = false;
      this.state.lockedBy = null;

      console.log('[Whiteboard] Left');
    }

    this.whiteboardId = null;
    this.userId = null;
    this.userName = null;
    this.handlers = {};
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.leaveWhiteboard();
  }
}
