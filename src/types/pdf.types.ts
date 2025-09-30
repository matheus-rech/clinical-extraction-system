/**
 * Type definitions for PDF handling
 */

import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

export interface PageTextContent {
  fullText: string;
  items: TextItem[];
}

export interface TextItem {
  text: string;
  transform: number[];
}

export interface TextLayerItem {
  element: HTMLSpanElement;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

export interface SearchResult {
  page: number;
  context: string;
  textItems: TextItem[];
}

export { PDFDocumentProxy, PDFPageProxy };
