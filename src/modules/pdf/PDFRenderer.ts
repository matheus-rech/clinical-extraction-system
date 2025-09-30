/**
 * PDF Rendering Module
 * Handles page rendering and text layer creation
 */

import { ErrorHandler } from '@core/ErrorHandler';
import AppStateManager from '@core/AppState';
import type { TextLayerItem } from '../../types/pdf.types';
import { TextSelection } from './TextSelection';
import { clearSearchMarkers } from './PDFSearch';

export class PDFRenderer {
  private textSelection: TextSelection;

  constructor() {
    this.textSelection = new TextSelection();
  }

  async renderPage(pageNum: number): Promise<void> {
    const state = AppStateManager.getState();
    
    if (!state.pdfDoc) {
      console.warn('No PDF loaded');
      return;
    }

    try {
      const page = await ErrorHandler.wrapAsync(
        () => state.pdfDoc!.getPage(pageNum),
        'RenderPage:GetPage'
      );

      const viewport = page.getViewport({ scale: state.scale });
      const container = document.getElementById('pdf-pages');
      
      if (!container) return;

      container.innerHTML = '';

      // Create page container
      const pageDiv = document.createElement('div');
      pageDiv.className = 'pdf-page';
      pageDiv.style.width = viewport.width + 'px';
      pageDiv.style.height = viewport.height + 'px';

      // Render PDF page to canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await ErrorHandler.wrapAsync(
        () => page.render({
          canvasContext: context,
          viewport: viewport
        }).promise,
        'RenderPage:Render'
      );

      pageDiv.appendChild(canvas);

      // Create text layer
      const textContent = await ErrorHandler.wrapAsync(
        () => page.getTextContent(),
        'RenderPage:GetTextContent'
      );

      const { textLayer, textItems } = this.createTextLayer(textContent, viewport);
      pageDiv.appendChild(textLayer);

      // Enable text selection
      this.textSelection.enable(textLayer, textItems, pageNum);

      // Add extraction markers for this page
      this.addExtractionMarkers(pageDiv, pageNum);

      container.appendChild(pageDiv);

      // Update state
      AppStateManager.setState({ currentPage: pageNum });
      (document.getElementById('page-num') as HTMLInputElement).value = pageNum.toString();

      // Clear any search markers when changing pages
      clearSearchMarkers();
    } catch (error) {
      ErrorHandler.handlePDFError(error);
    }
  }

  private createTextLayer(textContent: any, viewport: any): { 
    textLayer: HTMLDivElement; 
    textItems: TextLayerItem[] 
  } {
    const textLayer = document.createElement('div');
    textLayer.className = 'textLayer';

    const textItems: TextLayerItem[] = [];
    const state = AppStateManager.getState();

    textContent.items.forEach((item: any) => {
      if (!item.str.trim()) return;

      const span = document.createElement('span');
      span.textContent = item.str;

      const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
      span.style.left = tx[4] + 'px';
      span.style.top = tx[5] + 'px';
      span.style.fontSize = Math.sqrt((tx[0] * tx[0]) + (tx[1] * tx[1])) + 'px';

      span.dataset.x = tx[4].toString();
      span.dataset.y = tx[5].toString();
      span.dataset.width = (item.width * state.scale).toString();
      span.dataset.height = (item.height * state.scale).toString();

      textLayer.appendChild(span);
      textItems.push({
        element: span,
        x: tx[4],
        y: tx[5],
        width: item.width * state.scale,
        height: item.height * state.scale,
        text: item.str
      });
    });

    return { textLayer, textItems };
  }

  private addExtractionMarkers(pageDiv: HTMLDivElement, pageNum: number): void {
    const state = AppStateManager.getState();
    
    state.extractions
      .filter(ext => ext.page === pageNum)
      .forEach(ext => {
        const marker = document.createElement('div');
        marker.className = 'extraction-marker';
        marker.dataset.extractionId = ext.id;
        marker.dataset.field = ext.fieldName;

        marker.style.left = ext.coordinates.x + 'px';
        marker.style.top = ext.coordinates.y + 'px';
        marker.style.width = ext.coordinates.width + 'px';
        marker.style.height = ext.coordinates.height + 'px';

        pageDiv.appendChild(marker);
      });
  }
}
