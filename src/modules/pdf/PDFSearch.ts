/**
 * PDF Search Module
 * Implements text search across PDF pages
 */

import AppStateManager from '@core/AppState';
import { ErrorHandler } from '@core/ErrorHandler';
import { SecurityUtils } from '@core/SecurityUtils';
import type { PageTextContent, SearchResult } from '../../types/pdf.types';

export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\n\r]/g, ' ')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim()
    .toLowerCase();
}

export async function getPageText(pageNum: number): Promise<PageTextContent> {
  const state = AppStateManager.getState();
  
  if (state.pdfTextCache.has(pageNum)) {
    return state.pdfTextCache.get(pageNum)!;
  }

  try {
    if (!state.pdfDoc) {
      throw new Error('No PDF loaded');
    }

    const page = await state.pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    let fullText = '';
    const items: any[] = [];

    textContent.items.forEach((item: any) => {
      fullText += item.str + ' ';
      items.push({
        text: item.str,
        transform: item.transform
      });
    });

    const pageData: PageTextContent = { fullText, items };

    // Limit cache size
      if (state.pdfTextCache.size >= state.maxCacheSize) {
      const firstKey = state.pdfTextCache.keys().next().value;
      if (firstKey !== undefined) {
        state.pdfTextCache.delete(firstKey);
      }
    }

    state.pdfTextCache.set(pageNum, pageData);
    return pageData;
  } catch (error) {
    ErrorHandler.logError(error, `GetPageText:${pageNum}`);
    return { fullText: '', items: [] };
  }
}

export async function performSearch(query: string): Promise<SearchResult[]> {
  const state = AppStateManager.getState();
  const results: SearchResult[] = [];
  const normalizedQuery = normalizeText(query);
  const minMatchLength = Math.min(normalizedQuery.length, 20);

  for (let pageNum = 1; pageNum <= state.totalPages; pageNum++) {
    try {
      const pageText = await getPageText(pageNum);
      const normalizedPageText = normalizeText(pageText.fullText);

      let index = normalizedPageText.indexOf(normalizedQuery);

      // Fallback to word matching if exact match not found
      if (index === -1 && normalizedQuery.length > minMatchLength) {
        const queryWords = normalizedQuery.split(' ').filter(w => w.length > 3);
        for (const word of queryWords) {
          if (normalizedPageText.includes(word)) {
            index = normalizedPageText.indexOf(word);
            break;
          }
        }
      }

      if (index !== -1) {
        const contextStart = Math.max(0, index - 50);
        const contextEnd = Math.min(normalizedPageText.length, index + normalizedQuery.length + 50);
        const context = pageText.fullText.substring(contextStart, contextEnd);

        results.push({
          page: pageNum,
          context: SecurityUtils.sanitizeText(context),
          textItems: pageText.items
        });
      }
    } catch (error) {
      ErrorHandler.logError(error, `SearchPage:${pageNum}`);
    }
  }

  return results;
}

export function clearSearchMarkers(): void {
  const state = AppStateManager.getState();
  
  state.searchMarkers.forEach(marker => marker.remove());
  AppStateManager.setState({ searchMarkers: [] });

  document.querySelectorAll('.search-highlight').forEach(el => {
    el.classList.remove('search-highlight');
  });
}

export function displaySearchResults(results: SearchResult[], query: string): void {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;

  resultsContainer.innerHTML = '';

  if (results.length === 0) {
    resultsContainer.innerHTML = '<div style="padding: 10px; color: #666;">No matches found</div>';
    return;
  }

  results.forEach((result) => {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.innerHTML = `
      <strong>Page ${result.page}</strong><br>
      <span style="font-style: italic;">"...${SecurityUtils.escapeHtml(result.context)}..."</span>
    `;

    item.addEventListener('click', () => {
      // Will be handled by the search interface
      const event = new CustomEvent('search-result-click', { detail: { result, query } });
      document.dispatchEvent(event);
    });

    resultsContainer.appendChild(item);
  });
}
