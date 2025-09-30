/**
 * Main Application Class
 * Orchestrates all modules and handles application lifecycle
 */

import { PDFLoader } from '@modules/pdf/PDFLoader';
import { PDFRenderer } from '@modules/pdf/PDFRenderer';
import { ExtractionTracker } from '@modules/extraction/ExtractionTracker';
import { FormManager } from '@modules/form/FormManager';
import { ExportManager } from '@modules/export/ExportManager';
import { SearchInterface } from '@modules/ui/SearchInterface';
import { StatusManager } from '@modules/ui/StatusManager';
import { MemoryManager } from '@core/MemoryManager';
import AppStateManager from '@core/AppState';

export class Application {
  private pdfLoader: PDFLoader;
  private pdfRenderer: PDFRenderer;
  private formManager: FormManager;
  public exportManager: ExportManager;
  public searchInterface: SearchInterface;
  private memoryManager: MemoryManager;

  constructor() {
    this.pdfLoader = PDFLoader.getInstance();
    this.pdfRenderer = new PDFRenderer();
    ExtractionTracker.getInstance(); // Initialize but don't store
    this.formManager = new FormManager();
    this.exportManager = new ExportManager();
    this.searchInterface = new SearchInterface();
    this.memoryManager = MemoryManager.getInstance();
  }

  async initialize(): Promise<void> {
    // Initialize UI managers
    StatusManager.initialize();

    // Initialize form system
    this.formManager.initialize();

    // Initialize search interface
    this.searchInterface.initialize();

    // Set up event listeners
    this.setupEventListeners();

    // Subscribe to state changes
    AppStateManager.subscribe(this.handleStateChange.bind(this));

    // Load any saved extraction state
    await this.loadSavedState();

    StatusManager.show('System ready. Load a PDF to begin.', 'info');
  }

  private setupEventListeners(): void {
    // PDF upload buttons
    const pdfUploadBtn = document.getElementById('pdf-upload-btn');
    const pdfFileInput = document.getElementById('pdf-file') as HTMLInputElement;
    const pdfFileInput2 = document.getElementById('pdf-file-2') as HTMLInputElement;

    if (pdfUploadBtn) {
      this.memoryManager.registerEventListener(pdfUploadBtn, 'click', () => {
        pdfFileInput?.click();
      });
    }

    if (pdfFileInput) {
      this.memoryManager.registerEventListener(pdfFileInput, 'change', (e) => this.handlePDFUpload(e));
    }

    if (pdfFileInput2) {
      this.memoryManager.registerEventListener(pdfFileInput2, 'change', (e) => this.handlePDFUpload(e));
    }

    // PDF navigation
    const prevPageBtn = document.getElementById('pdf-prev-page');
    const nextPageBtn = document.getElementById('pdf-next-page');
    const pageNumInput = document.getElementById('page-num') as HTMLInputElement;

    if (prevPageBtn) {
      this.memoryManager.registerEventListener(prevPageBtn, 'click', () => this.previousPage());
    }

    if (nextPageBtn) {
      this.memoryManager.registerEventListener(nextPageBtn, 'click', () => this.nextPage());
    }

    if (pageNumInput) {
      this.memoryManager.registerEventListener(pageNumInput, 'change', (e) => {
        const pageNum = parseInt((e.target as HTMLInputElement).value);
        const state = AppStateManager.getState();
        if (pageNum >= 1 && pageNum <= state.totalPages) {
          this.pdfRenderer.renderPage(pageNum);
        }
      });
    }

    // Zoom controls
    const zoomSelect = document.getElementById('zoom-level') as HTMLSelectElement;
    const fitWidthBtn = document.getElementById('fit-width');

    if (zoomSelect) {
      this.memoryManager.registerEventListener(zoomSelect, 'change', (e) => {
        const scale = parseFloat((e.target as HTMLSelectElement).value);
        AppStateManager.setState({ scale });
        const state = AppStateManager.getState();
        this.pdfRenderer.renderPage(state.currentPage);
      });
    }

    if (fitWidthBtn) {
      this.memoryManager.registerEventListener(fitWidthBtn, 'click', () => this.fitWidth());
    }

    // Drag and drop
    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
      this.memoryManager.registerEventListener(uploadArea, 'dragover', (e) => {
        e.preventDefault();
        (e.target as HTMLElement).style.background = '#e3f2fd';
      });

      this.memoryManager.registerEventListener(uploadArea, 'dragleave', (e) => {
        (e.target as HTMLElement).style.background = '';
      });

      this.memoryManager.registerEventListener(uploadArea, 'drop', (e) => {
        e.preventDefault();
        (e.target as HTMLElement).style.background = '';
        const dt = (e as DragEvent).dataTransfer;
        const file = dt?.files[0];
        if (file && file.type === 'application/pdf') {
          this.loadPDF(file);
        }
      });
    }

    // Custom events
    document.addEventListener('navigate-to-page', ((e: CustomEvent) => {
      this.pdfRenderer.renderPage(e.detail.page);
    }) as EventListener);

    document.addEventListener('dynamic-fields-added', () => {
      this.formManager.initialize();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  private async handlePDFUpload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      await this.loadPDF(file);
    }
  }

  private async loadPDF(file: File): Promise<void> {
    try {
      await this.pdfLoader.loadPDF(file);
      await this.pdfRenderer.renderPage(1);
    } catch (error) {
      console.error('Failed to load PDF:', error);
    }
  }

  private previousPage(): void {
    const state = AppStateManager.getState();
    if (state.currentPage > 1) {
      this.pdfRenderer.renderPage(state.currentPage - 1);
    }
  }

  private nextPage(): void {
    const state = AppStateManager.getState();
    if (state.currentPage < state.totalPages) {
      this.pdfRenderer.renderPage(state.currentPage + 1);
    }
  }

  private async fitWidth(): Promise<void> {
    const state = AppStateManager.getState();
    if (!state.pdfDoc) return;

    const container = document.getElementById('pdf-container');
    if (!container) return;

    const containerWidth = container.clientWidth - 40;
    const page = await state.pdfDoc.getPage(state.currentPage);
    const viewport = page.getViewport({ scale: 1.0 });
    const newScale = containerWidth / viewport.width;

    AppStateManager.setState({ scale: newScale });
    
    const zoomSelect = document.getElementById('zoom-level') as HTMLSelectElement;
    if (zoomSelect) {
      zoomSelect.value = newScale.toFixed(2);
    }

    await this.pdfRenderer.renderPage(state.currentPage);
  }

  private handleKeyboard(e: KeyboardEvent): void {
    if (e.ctrlKey && e.key === 'o') {
      e.preventDefault();
      document.getElementById('pdf-file')?.click();
    }

    const target = e.target as HTMLElement;
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      const state = AppStateManager.getState();
      
      if (e.key === 'ArrowLeft' && state.currentPage > 1) {
        this.previousPage();
      } else if (e.key === 'ArrowRight' && state.currentPage < state.totalPages) {
        this.nextPage();
      }
    }
  }

  private handleStateChange(): void {
    // Update UI elements based on state changes
    // This provides a centralized place for reactive updates
  }

  private async loadSavedState(): Promise<void> {
    // Extraction tracker already loads from localStorage in its constructor
    // Any additional state restoration can go here
  }
}
