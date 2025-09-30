/**
 * Status Message Manager
 * Handles user feedback messages and loading states
 */

import { MemoryManager } from '@core/MemoryManager';

type StatusType = 'success' | 'warning' | 'error' | 'info';

export class StatusManager {
  private static statusDiv: HTMLElement | null = null;
  private static messageSpan: HTMLElement | null = null;
  private static spinnerDiv: HTMLElement | null = null;

  static initialize(): void {
    this.statusDiv = document.getElementById('extraction-status');
    this.messageSpan = document.getElementById('status-message');
    this.spinnerDiv = document.getElementById('loading-spinner');
  }

  static show(message: string, type: StatusType = 'info'): void {
    if (!this.statusDiv || !this.messageSpan) {
      console.warn('StatusManager not initialized');
      return;
    }

    this.messageSpan.textContent = message;
    this.statusDiv.className = 'extraction-status show';

    const colors = {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#f44336',
      info: '#2196F3'
    };

    this.statusDiv.style.background = colors[type] || colors.info;
    this.statusDiv.style.color = 'white';

    const timeoutId = window.setTimeout(() => {
      this.statusDiv?.classList.remove('show');
    }, 3000);

    MemoryManager.getInstance().registerTimeout(timeoutId);
  }

  static showLoading(show: boolean): void {
    if (!this.spinnerDiv) {
      console.warn('Loading spinner not initialized');
      return;
    }

    if (show) {
      this.spinnerDiv.classList.add('active');
    } else {
      this.spinnerDiv.classList.remove('active');
    }
  }
}
