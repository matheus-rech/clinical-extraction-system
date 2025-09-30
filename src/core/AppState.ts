/**
 * Global Application State Management
 * Implements observer pattern for reactive state updates
 */

import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { Extraction } from '../types/extraction.types';
import type { PageTextContent } from '../types/pdf.types';

export interface AppState {
  pdfDoc: PDFDocumentProxy | null;
  currentPage: number;
  totalPages: number;
  scale: number;
  activeField: string | null;
  activeFieldElement: HTMLElement | null;
  documentName: string;
  extractions: Extraction[];
  currentStep: number;
  totalSteps: number;
  markdownContent: string;
  markdownLoaded: boolean;
  pdfTextCache: Map<number, PageTextContent>;
  searchMarkers: HTMLElement[];
  maxCacheSize: number;
  isProcessing: boolean;
}

type StateSubscriber = (state: Readonly<AppState>) => void;

class AppStateManager {
  private state: AppState;
  private subscribers: Set<StateSubscriber>;

  constructor() {
    this.state = this.getInitialState();
    this.subscribers = new Set();
  }

  private getInitialState(): AppState {
    return {
      pdfDoc: null,
      currentPage: 1,
      totalPages: 0,
      scale: 1.0,
      activeField: null,
      activeFieldElement: null,
      documentName: '',
      extractions: [],
      currentStep: 0,
      totalSteps: 8,
      markdownContent: '',
      markdownLoaded: false,
      pdfTextCache: new Map(),
      searchMarkers: [],
      maxCacheSize: 50,
      isProcessing: false
    };
  }

  getState(): Readonly<AppState> {
    return Object.freeze({ ...this.state });
  }

  setState(updates: Partial<AppState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  subscribe(callback: StateSubscriber): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notify(): void {
    const frozenState = this.getState();
    this.subscribers.forEach(callback => callback(frozenState));
  }

  reset(): void {
    this.state = this.getInitialState();
    this.notify();
  }
}

export default new AppStateManager();
