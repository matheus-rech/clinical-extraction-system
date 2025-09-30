/**
 * Extraction Tracker Module
 * Manages extraction history, trace log, and persistence
 */

import { SecurityUtils } from '@core/SecurityUtils';
import { ErrorHandler } from '@core/ErrorHandler';
import { MemoryManager } from '@core/MemoryManager';
import AppStateManager from '@core/AppState';
import type { Extraction, Coordinates } from '../../types/extraction.types';

interface ExtractionData {
  fieldName: string;
  text: string;
  page: number;
  coordinates: Coordinates;
  method: 'manual' | 'markdown-search';
  documentName: string;
}

export class ExtractionTracker {
  private static instance: ExtractionTracker;
  private extractions: Extraction[];
  private fieldMap: Map<string, Extraction>;
  private memoryManager: MemoryManager;

  private constructor() {
    this.extractions = [];
    this.fieldMap = new Map();
    this.memoryManager = MemoryManager.getInstance();
    this.loadFromStorage();
  }

  static getInstance(): ExtractionTracker {
    if (!ExtractionTracker.instance) {
      ExtractionTracker.instance = new ExtractionTracker();
    }
    return ExtractionTracker.instance;
  }

  addExtraction(data: ExtractionData): Extraction | null {
    // Sanitize input data
    const sanitizedData = {
      ...data,
      text: SecurityUtils.sanitizeText(data.text),
      fieldName: SecurityUtils.sanitizeText(data.fieldName),
      documentName: SecurityUtils.sanitizeText(data.documentName)
    };

    // Validate extraction
    const validationData = {
      ...sanitizedData,
      id: 'temp',
      timestamp: new Date().toISOString()
    };

    if (!SecurityUtils.validateExtraction(validationData)) {
      ErrorHandler.logError(new Error('Invalid extraction data'), 'ExtractionTracker');
      return null;
    }

    const extraction: Extraction = {
      id: `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...sanitizedData
    };

    this.extractions.push(extraction);
    this.fieldMap.set(data.fieldName, extraction);

    this.updateTraceLog(extraction);
    this.updateStats();
    this.saveToStorage();

    // Update AppState
    AppStateManager.setState({ extractions: this.extractions });

    return extraction;
  }

  getExtractions(): Extraction[] {
    return [...this.extractions];
  }

  clearAll(): void {
    this.extractions = [];
    this.fieldMap.clear();
    localStorage.removeItem('clinical_extractions_secure');
    
    const logContainer = document.getElementById('trace-log');
    if (logContainer) logContainer.innerHTML = '';
    
    this.updateStats();
    AppStateManager.setState({ extractions: [] });
  }

  private updateTraceLog(extraction: Extraction): void {
    const logContainer = document.getElementById('trace-log');
    if (!logContainer) return;

    const entry = document.createElement('div');
    entry.className = 'trace-entry';
    entry.dataset.extractionId = extraction.id;

    const truncatedText = extraction.text.length > 80
      ? extraction.text.substring(0, 80) + '...'
      : extraction.text;

    entry.innerHTML = `
      <span class="field-label">${SecurityUtils.escapeHtml(extraction.fieldName)}</span>
      <span class="extracted-text">"${SecurityUtils.escapeHtml(truncatedText)}"</span>
      <div class="metadata">
        Page ${extraction.page} | ${extraction.method} | ${new Date(extraction.timestamp).toLocaleTimeString()}
      </div>
    `;

    const handleClick = () => this.navigateToExtraction(extraction);
    this.memoryManager.registerEventListener(entry, 'click', handleClick);
    
    logContainer.insertBefore(entry, logContainer.firstChild);
  }

  private async navigateToExtraction(extraction: Extraction): Promise<void> {
    const state = AppStateManager.getState();
    
    if (extraction.page !== state.currentPage) {
      // Trigger page render
      const event = new CustomEvent('navigate-to-page', { detail: { page: extraction.page } });
      document.dispatchEvent(event);
    }

    setTimeout(() => {
      const marker = document.querySelector(`[data-extraction-id="${extraction.id}"]`) as HTMLElement;
      if (marker) {
        marker.scrollIntoView({ behavior: 'smooth', block: 'center' });
        marker.style.background = 'rgba(255, 193, 7, 0.5)';
        
        const timeoutId = window.setTimeout(() => {
          marker.style.background = 'rgba(76, 175, 80, 0.15)';
        }, 1000);
        
        this.memoryManager.registerTimeout(timeoutId);
      }
    }, 500);
  }

  private updateStats(): void {
    const countEl = document.getElementById('extraction-count');
    const pagesEl = document.getElementById('pages-with-data');

    if (countEl) countEl.textContent = this.extractions.length.toString();
    if (pagesEl) {
      const uniquePages = new Set(this.extractions.map(e => e.page));
      pagesEl.textContent = uniquePages.size.toString();
    }
  }

  private saveToStorage(): void {
    try {
      const encoded = SecurityUtils.encodeData(this.extractions);
      if (encoded) {
        localStorage.setItem('clinical_extractions_secure', encoded);
      }
    } catch (e) {
      ErrorHandler.logError(e, 'SaveToLocalStorage');
    }
  }

  loadFromStorage(): void {
    try {
      const encoded = localStorage.getItem('clinical_extractions_secure');
      if (!encoded) {
        // Try legacy format
        const legacy = localStorage.getItem('clinical_extractions');
        if (legacy) {
          this.extractions = JSON.parse(legacy);
          localStorage.removeItem('clinical_extractions');
          this.saveToStorage(); // Save in new format
        }
        return;
      }

      const decoded = SecurityUtils.decodeData(encoded);
      if (decoded && Array.isArray(decoded)) {
        this.extractions = decoded.filter(ext => SecurityUtils.validateExtraction(ext));
        this.extractions.forEach(ext => {
          this.fieldMap.set(ext.fieldName, ext);
          this.updateTraceLog(ext);
        });
        this.updateStats();
        AppStateManager.setState({ extractions: this.extractions });
      }
    } catch (e) {
      ErrorHandler.logError(e, 'LoadFromLocalStorage');
      localStorage.removeItem('clinical_extractions_secure');
    }
  }
}
