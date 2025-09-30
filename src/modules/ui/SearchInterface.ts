/**
 * Search Interface Module
 * Handles markdown loading and PDF text search
 */

import AppStateManager from '@core/AppState';
import { StatusManager } from './StatusManager';
import { MemoryManager } from '@core/MemoryManager';
import { performSearch, displaySearchResults, clearSearchMarkers } from '@modules/pdf/PDFSearch';

export class SearchInterface {
  private memoryManager: MemoryManager;

  constructor() {
    this.memoryManager = MemoryManager.getInstance();
  }

  initialize(): void {
    // Markdown file loading
    const markdownInput = document.getElementById('markdown-file') as HTMLInputElement;
    if (markdownInput) {
      this.memoryManager.registerEventListener(markdownInput, 'change', (e) => this.handleMarkdownLoad(e));
    }

    // Listen for search result clicks
    document.addEventListener('search-result-click', ((e: CustomEvent) => {
      this.handleSearchResultClick(e.detail.result, e.detail.query);
    }) as EventListener);
  }

  private async handleMarkdownLoad(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      try {
        const text = await file.text();
        AppStateManager.setState({
          markdownContent: text,
          markdownLoaded: true
        });

        const statusEl = document.getElementById('markdown-status');
        if (statusEl) {
          statusEl.textContent = `✓ Loaded: ${file.name}`;
          statusEl.style.color = '#4CAF50';
        }

        StatusManager.show('Markdown file loaded successfully', 'success');
      } catch (error) {
        StatusManager.show('Failed to load markdown file', 'error');
        console.error(error);
      }
    }
  }

  toggleSearchInterface(): void {
    const searchInterface = document.getElementById('search-interface');
    if (searchInterface) {
      searchInterface.classList.toggle('active');
    }
  }

  async searchInPDF(): Promise<void> {
    const query = (document.getElementById('search-query') as HTMLTextAreaElement)?.value.trim();
    
    if (!query) {
      StatusManager.show('Please enter text to search', 'warning');
      return;
    }

    const state = AppStateManager.getState();
    if (!state.pdfDoc) {
      StatusManager.show('Please load a PDF first', 'warning');
      return;
    }

    if (state.isProcessing) {
      StatusManager.show('Please wait for current operation to complete', 'warning');
      return;
    }

    AppStateManager.setState({ isProcessing: true });
    StatusManager.showLoading(true);
    StatusManager.show('Searching across all pages...', 'info');
    clearSearchMarkers();

    try {
      const results = await performSearch(query);
      displaySearchResults(results, query);

      if (results.length > 0) {
        StatusManager.show(`Found ${results.length} match(es)`, 'success');
        
        // Navigate to first result
        const event = new CustomEvent('search-result-click', {
          detail: { result: results[0], query }
        });
        document.dispatchEvent(event);
      } else {
        StatusManager.show('No matches found', 'warning');
      }
    } catch (error) {
      console.error('Search failed:', error);
      StatusManager.show('Search failed', 'error');
    } finally {
      AppStateManager.setState({ isProcessing: false });
      StatusManager.showLoading(false);
    }
  }

  private async handleSearchResultClick(result: any, query: string): Promise<void> {
    // Navigate to the page
    const event = new CustomEvent('navigate-to-page', { detail: { page: result.page } });
    document.dispatchEvent(event);

    // Wait for page to render then highlight
    setTimeout(() => {
      this.highlightSearchResult(result, query);
    }, 500);
  }

  private highlightSearchResult(result: any, query: string): void {
    // This would implement the highlighting logic from PDFSearch
    // Simplified for now - full implementation would be in PDFSearch module
    console.log('Highlighting search result:', result, query);
  }
}
