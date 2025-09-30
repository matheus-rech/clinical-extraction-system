/**
 * Unit Tests for AppState Manager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import AppStateManager from '@core/AppState';

describe('AppState', () => {
  beforeEach(() => {
    AppStateManager.reset();
  });

  it('should have correct initial state', () => {
    const state = AppStateManager.getState();
    
    expect(state.pdfDoc).toBeNull();
    expect(state.currentPage).toBe(1);
    expect(state.totalPages).toBe(0);
    expect(state.scale).toBe(1.0);
    expect(state.currentStep).toBe(0);
    expect(state.totalSteps).toBe(8);
    expect(state.isProcessing).toBe(false);
  });

  it('should update state correctly', () => {
    AppStateManager.setState({ currentPage: 5 });
    const state = AppStateManager.getState();
    expect(state.currentPage).toBe(5);
  });

  it('should preserve other state when updating', () => {
    AppStateManager.setState({ currentPage: 5 });
    AppStateManager.setState({ scale: 1.5 });
    
    const state = AppStateManager.getState();
    expect(state.currentPage).toBe(5);
    expect(state.scale).toBe(1.5);
  });

  it('should notify subscribers on state change', () => {
    let notified = false;
    let receivedState: any = null;

    const unsubscribe = AppStateManager.subscribe((state) => {
      notified = true;
      receivedState = state;
    });

    AppStateManager.setState({ currentPage: 3 });

    expect(notified).toBe(true);
    expect(receivedState.currentPage).toBe(3);

    unsubscribe();
  });

  it('should allow unsubscribing', () => {
    let callCount = 0;

    const unsubscribe = AppStateManager.subscribe(() => {
      callCount++;
    });

    AppStateManager.setState({ currentPage: 2 });
    expect(callCount).toBe(1);

    unsubscribe();
    AppStateManager.setState({ currentPage: 3 });
    expect(callCount).toBe(1); // Should not increment
  });

  it('should reset to initial state', () => {
    AppStateManager.setState({ currentPage: 10, scale: 2.0 });
    AppStateManager.reset();
    
    const state = AppStateManager.getState();
    expect(state.currentPage).toBe(1);
    expect(state.scale).toBe(1.0);
  });
});
