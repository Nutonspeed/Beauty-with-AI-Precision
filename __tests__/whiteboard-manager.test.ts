/**
 * Whiteboard Manager Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WhiteboardManager, DrawingElement, UserCursor } from '@/lib/whiteboard-manager';

// Mock WebSocket Client
vi.mock('@/lib/websocket-client', () => ({
  default: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    send: vi.fn(),
    on: vi.fn()
  }
}));

describe('WhiteboardManager', () => {
  let manager: WhiteboardManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new WhiteboardManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('Join Whiteboard', () => {
    it('should join a whiteboard session', async () => {
      const wsClient = await import('@/lib/websocket-client');
      const handlers = {
        onElementAdded: vi.fn()
      };

      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', handlers);

      expect(wsClient.default.send).toHaveBeenCalledWith('whiteboard_join', expect.objectContaining({
        whiteboardId: 'board-1',
        userId: 'user-1',
        userName: 'Dr. Smith'
      }));
    });
  });

  describe('Add Elements', () => {
    beforeEach(() => {
      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', {});
    });

    it('should add a pen drawing element', async () => {
      const wsClient = await import('@/lib/websocket-client');
      const element = manager.addElement({
        type: 'pen',
        color: 'black',
        width: 2,
        points: [{ x: 10, y: 10 }, { x: 20, y: 20 }]
      });

      expect(element.id).toBeDefined();
      expect(element.type).toBe('pen');
      expect(element.userId).toBe('user-1');
      expect(element.userName).toBe('Dr. Smith');
      expect(wsClient.default.send).toHaveBeenCalledWith('whiteboard_element_add', expect.any(Object));
    });

    it('should add a rectangle element', () => {
      const element = manager.addElement({
        type: 'rectangle',
        color: 'blue',
        width: 2,
        x: 100,
        y: 100,
        width_shape: 200,
        height: 150
      });

      expect(element.type).toBe('rectangle');
      expect(element.x).toBe(100);
      expect(element.y).toBe(100);
    });

    it('should call onElementAdded handler', () => {
      const handler = vi.fn();
      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', {
        onElementAdded: handler
      });

      manager.addElement({
        type: 'pen',
        color: 'black',
        width: 2,
        points: [{ x: 10, y: 10 }]
      });

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Remove Elements', () => {
    beforeEach(() => {
      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', {});
    });

    it('should remove an element', async () => {
      const wsClient = await import('@/lib/websocket-client');
      const element = manager.addElement({
        type: 'pen',
        color: 'black',
        width: 2,
        points: [{ x: 10, y: 10 }]
      });

      manager.removeElement(element.id);

      const elements = manager.getAllElements();
      expect(elements).toHaveLength(0);
      expect(wsClient.default.send).toHaveBeenCalledWith('whiteboard_element_remove', expect.any(Object));
    });

    it('should call onElementRemoved handler', () => {
      const handler = vi.fn();
      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', {
        onElementRemoved: handler
      });

      const element = manager.addElement({
        type: 'pen',
        color: 'black',
        width: 2,
        points: [{ x: 10, y: 10 }]
      });

      manager.removeElement(element.id);

      expect(handler).toHaveBeenCalledWith(element.id);
    });
  });

  describe('Update Elements', () => {
    beforeEach(() => {
      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', {});
    });

    it('should update an element', async () => {
      const wsClient = await import('@/lib/websocket-client');
      const element = manager.addElement({
        type: 'text',
        color: 'black',
        width: 2,
        x: 100,
        y: 100,
        text: 'Original',
        fontSize: 16
      });

      manager.updateElement(element.id, { text: 'Updated' });

      const elements = manager.getAllElements();
      expect(elements[0].text).toBe('Updated');
      expect(wsClient.default.send).toHaveBeenCalledWith('whiteboard_element_update', expect.any(Object));
    });
  });

  describe('Clear Whiteboard', () => {
    beforeEach(() => {
      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', {});
    });

    it('should clear all elements', async () => {
      const wsClient = await import('@/lib/websocket-client');
      manager.addElement({
        type: 'pen',
        color: 'black',
        width: 2,
        points: [{ x: 10, y: 10 }]
      });

      manager.addElement({
        type: 'circle',
        color: 'red',
        width: 2,
        x: 50,
        y: 50,
        width_shape: 100,
        height: 100
      });

      manager.clearWhiteboard();

      const elements = manager.getAllElements();
      expect(elements).toHaveLength(0);
      expect(wsClient.default.send).toHaveBeenCalledWith('whiteboard_clear', expect.any(Object));
    });

    it('should call onWhiteboardCleared handler', () => {
      const handler = vi.fn();
      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', {
        onWhiteboardCleared: handler
      });

      manager.clearWhiteboard();

      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Lock/Unlock', () => {
    beforeEach(() => {
      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', {});
    });

    it('should lock whiteboard', async () => {
      const wsClient = await import('@/lib/websocket-client');
      manager.lockWhiteboard();

      const state = manager.getState();
      expect(state.isLocked).toBe(true);
      expect(state.lockedBy).toBe('user-1');
      expect(wsClient.default.send).toHaveBeenCalledWith('whiteboard_lock', expect.any(Object));
    });

    it('should unlock whiteboard', async () => {
      const wsClient = await import('@/lib/websocket-client');
      manager.lockWhiteboard();
      manager.unlockWhiteboard();

      const state = manager.getState();
      expect(state.isLocked).toBe(false);
      expect(state.lockedBy).toBe(null);
      expect(wsClient.default.send).toHaveBeenCalledWith('whiteboard_unlock', expect.any(Object));
    });

    it('should check if user can draw when locked', () => {
      manager.lockWhiteboard();
      expect(manager.canDraw()).toBe(true); // User locked it, so they can draw

      // Simulate another user
      const manager2 = new WhiteboardManager();
      manager2.joinWhiteboard('board-1', 'user-2', 'Dr. Jones', {});
      // We can't easily test this without simulating WebSocket messages
    });
  });

  describe('Get Elements', () => {
    beforeEach(() => {
      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', {});
    });

    it('should get all elements sorted by timestamp', () => {
      const elem1 = manager.addElement({
        type: 'pen',
        color: 'black',
        width: 2,
        points: [{ x: 10, y: 10 }]
      });

      // Wait a bit to ensure different timestamps
      const elem2 = manager.addElement({
        type: 'circle',
        color: 'red',
        width: 2,
        x: 50,
        y: 50,
        width_shape: 100,
        height: 100
      });

      const elements = manager.getAllElements();
      expect(elements).toHaveLength(2);
      expect(elements[0].id).toBe(elem1.id);
      expect(elements[1].id).toBe(elem2.id);
    });
  });

  describe('Export/Import', () => {
    beforeEach(() => {
      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', {});
    });

    it('should export as JSON', () => {
      manager.addElement({
        type: 'pen',
        color: 'black',
        width: 2,
        points: [{ x: 10, y: 10 }]
      });

      const json = manager.exportAsJSON();
      const data = JSON.parse(json);

      expect(data.whiteboardId).toBe('board-1');
      expect(data.elements).toHaveLength(1);
      expect(data.exportedAt).toBeDefined();
    });

    it('should import from JSON', () => {
      const jsonData = {
        whiteboardId: 'board-1',
        elements: [
          {
            id: 'elem-1',
            type: 'pen',
            color: 'black',
            width: 2,
            points: [{ x: 10, y: 10 }],
            timestamp: Date.now(),
            userId: 'user-1',
            userName: 'Dr. Smith'
          }
        ],
        exportedAt: Date.now()
      };

      const handler = vi.fn();
      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', {
        onElementAdded: handler
      });

      manager.importFromJSON(JSON.stringify(jsonData));

      const elements = manager.getAllElements();
      expect(elements).toHaveLength(1);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('Leave Whiteboard', () => {
    it('should leave whiteboard and cleanup', async () => {
      const wsClient = await import('@/lib/websocket-client');
      manager.joinWhiteboard('board-1', 'user-1', 'Dr. Smith', {});
      manager.addElement({
        type: 'pen',
        color: 'black',
        width: 2,
        points: [{ x: 10, y: 10 }]
      });

      manager.leaveWhiteboard();

      expect(wsClient.default.send).toHaveBeenCalledWith('whiteboard_leave', expect.any(Object));

      const elements = manager.getAllElements();
      expect(elements).toHaveLength(0);
    });
  });
});
