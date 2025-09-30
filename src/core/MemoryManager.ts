/**
 * Memory and Resource Management
 * Tracks event listeners, intervals, and timeouts for proper cleanup
 */

type EventListenerInfo = {
  event: string;
  handler: EventListenerOrEventListenerObject;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private cleanupCallbacks: (() => void)[];
  private eventListeners: Map<EventTarget, EventListenerInfo[]>;
  private intervals: Set<number>;
  private timeouts: Set<number>;

  private constructor() {
    this.cleanupCallbacks = [];
    this.eventListeners = new Map();
    this.intervals = new Set();
    this.timeouts = new Set();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => this.cleanup());
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Register an event listener for cleanup tracking
   */
  registerEventListener(
    element: EventTarget,
    event: string,
    handler: EventListenerOrEventListenerObject
  ): void {
    element.addEventListener(event, handler);

    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element)!.push({ event, handler });
  }

  /**
   * Register interval for cleanup tracking
   */
  registerInterval(intervalId: number): void {
    this.intervals.add(intervalId);
  }

  /**
   * Register timeout for cleanup tracking
   */
  registerTimeout(timeoutId: number): void {
    this.timeouts.add(timeoutId);
  }

  /**
   * Register custom cleanup callback
   */
  registerCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Clean up all tracked resources
   */
  cleanup(): void {
    // Remove all event listeners
    for (const [element, listeners] of this.eventListeners) {
      for (const { event, handler } of listeners) {
        element.removeEventListener(event, handler);
      }
    }
    this.eventListeners.clear();

    // Clear all intervals
    for (const intervalId of this.intervals) {
      clearInterval(intervalId);
    }
    this.intervals.clear();

    // Clear all timeouts
    for (const timeoutId of this.timeouts) {
      clearTimeout(timeoutId);
    }
    this.timeouts.clear();

    // Run custom cleanup callbacks
    for (const callback of this.cleanupCallbacks) {
      try {
        callback();
      } catch (e) {
        console.error('Cleanup callback failed:', e);
      }
    }
    this.cleanupCallbacks = [];

    console.log('MemoryManager: All resources cleaned up');
  }
}
