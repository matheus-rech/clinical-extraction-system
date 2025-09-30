/**
 * PDF Loading Module
 * Handles PDF file loading and initialization
 */

import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { ErrorHandler } from '@core/ErrorHandler';
import { SecurityUtils } from '@core/SecurityUtils';
import AppStateManager from '@core/AppState';
import { PDFConfig } from '@config/pdf.config';
import { StatusManager } from '@modules/ui/StatusManager';

// Make pdfjsLib available globally for compatibility
(window as any).pdfjsLib = pdfjsLib;

export class PDFLoader {
  private static instance: PDFLoader;

  private constructor() {
    this.initializePDFJS();
  }

  static getInstance(): PDFLoader {
    if (!PDFLoader.instance) {
      PDFLoader.instance = new PDFLoader();
    }
    return PDFLoader.instance;
  }

  private initializePDFJS(): void {
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFConfig.workerSrc;
  }

  async loadPDF(file: File): Promise<PDFDocumentProxy> {
    const state = AppStateManager.getState();

    if (state.isProcessing) {
      throw new Error('Another operation in progress');
    }

    AppStateManager.setState({ isProcessing: true });
    StatusManager.showLoading(true);

    try {
      const arrayBuffer = await ErrorHandler.wrapAsync(
        () => file.arrayBuffer(),
        'PDFLoad:ArrayBuffer'
      );

      const pdfDoc = await ErrorHandler.wrapAsync(
        () => pdfjsLib.getDocument({
          data: arrayBuffer,
          ...PDFConfig.documentOptions
        }).promise,
        'PDFLoad:GetDocument'
      ) as PDFDocumentProxy;

      const sanitizedName = SecurityUtils.sanitizeText(file.name);

      AppStateManager.setState({
        pdfDoc,
        totalPages: pdfDoc.numPages,
        documentName: sanitizedName,
        isProcessing: false
      });

      // Clear old cache if needed
      if (state.pdfTextCache.size > state.maxCacheSize) {
        state.pdfTextCache.clear();
      }

      // Update UI
      document.getElementById('total-pages')!.textContent = pdfDoc.numPages.toString();
      document.getElementById('upload-area')!.style.display = 'none';
      document.getElementById('pdf-pages')!.style.display = 'block';

      StatusManager.showLoading(false);
      StatusManager.show('PDF loaded successfully', 'success');

      return pdfDoc;
    } catch (error) {
      AppStateManager.setState({ isProcessing: false });
      StatusManager.showLoading(false);
      ErrorHandler.handlePDFError(error);
      throw error;
    }
  }

  async unloadPDF(): Promise<void> {
    const state = AppStateManager.getState();

    if (state.pdfDoc) {
      await state.pdfDoc.destroy();
      AppStateManager.setState({
        pdfDoc: null,
        totalPages: 0,
        documentName: '',
        currentPage: 1
      });
    }
  }
}
