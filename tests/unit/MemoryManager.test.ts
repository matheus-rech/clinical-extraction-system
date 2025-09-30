/**
 * Unit Tests for MemoryManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryManager } from '@core/MemoryManager';

describe('MemoryManager', () => {
  let memoryManager: MemoryManager;

  beforeEach(() => {
    memoryManager = MemoryManager.getInstance();
  });

  it('should be a singleton', () => {
    const instance1 = MemoryManager.getInstance();
    const instance2 = MemoryManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  describe('Event Listener Management', () => {
    it('should register event listeners', () => {
      const element = document.createElement('button');
      const handler = vi.fn();

      memoryManager.registerEventListener(element, 'click', handler);
      element.click();

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should prevent duplicate listener registration', () => {
      const element = document.createElement('button');
      const handler = vi.fn();

      memoryManager.registerEventListener(element, 'click', handler);
      memoryManager.registerEventListener(element, 'click', handler);
      
      element.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple listeners on same element', () => {
      const element = document.createElement('button');
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      memoryManager.registerEventListener(element, 'click', handler1);
      memoryManager.registerEventListener(element, 'mouseenter', handler2);
      
      element.click();
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should cleanup event listeners', () => {
      const element = document.createElement('button');
      const handler = vi.fn();

      memoryManager.registerEventListener(element, 'click', handler);
      memoryManager.cleanup();
      
      element.click();
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Memory Cleanup', () => {
    it('should remove all registered listeners on cleanup', () => {
      const element1 = document.createElement('button');
      const element2 = document.createElement('button');
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      memoryManager.registerEventListener(element1, 'click', handler1);
      memoryManager.registerEventListener(element2, 'click', handler2);
      
      memoryManager.cleanup();
      
      element1.click();
      element2.click();
      
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should handle cleanup with no listeners', () => {
      expect(() => memoryManager.cleanup()).not.toThrow();
    });

    it('should allow re-registration after cleanup', () => {
      const element = document.createElement('button');
      const handler = vi.fn();

      memoryManager.registerEventListener(element, 'click', handler);
      memoryManager.cleanup();
      memoryManager.registerEventListener(element, 'click', handler);
      
      element.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should track multiple listeners on different elements', () => {
      const element1 = document.createElement('button');
      const element2 = document.createElement('button');
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      memoryManager.registerEventListener(element1, 'click', handler1);
      memoryManager.registerEventListener(element2, 'focus', handler2);
      
      element1.click();
      element2.dispatchEvent(new Event('focus'));
      
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should cleanup all listeners', () => {
      const element = document.createElement('button');
      const handler = vi.fn();

      memoryManager.registerEventListener(element, 'click', handler);
      element.click();
      expect(handler).toHaveBeenCalledTimes(1);
      
      memoryManager.cleanup();
      element.click();
      
      // After cleanup, handler should not be called again
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid event types', () => {
      const element = document.createElement('button');
      expect(() => {
        memoryManager.registerEventListener(element, 'invalid-event' as any, () => {});
      }).not.toThrow();
    });

    it('should register custom events', () => {
      const element = document.createElement('div');
      const handler = vi.fn();
      
      memoryManager.registerEventListener(element, 'custom-event', handler);
      element.dispatchEvent(new Event('custom-event'));
      
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should handle cleanup callbacks', () => {
      const callback = vi.fn();
      memoryManager.registerCleanup(callback);
      memoryManager.cleanup();
      
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
