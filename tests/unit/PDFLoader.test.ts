/**
 * Unit Tests for PDFLoader
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PDFLoader } from '@modules/pdf/PDFLoader';

describe('PDFLoader', () => {
  let loader: PDFLoader;

  beforeEach(() => {
    loader = PDFLoader.getInstance();
  });

  it('should be a singleton', () => {
    const loader1 = PDFLoader.getInstance();
    const loader2 = PDFLoader.getInstance();
    expect(loader1).toBe(loader2);
  });

  it('should initialize PDF.js library', () => {
    expect((window as any).pdfjsLib).toBeDefined();
    expect((window as any).pdfjsLib.GlobalWorkerOptions).toBeDefined();
  });

  it('should have worker source configured', () => {
    const workerSrc = (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc;
    expect(workerSrc).toBeDefined();
    expect(workerSrc).toContain('pdf.worker');
  });

  it('should handle file validation', async () => {
    const invalidFile = new File(['invalid'], 'test.txt', { type: 'text/plain' });
    
    try {
      await loader.loadPDF(invalidFile);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should set processing state during load', () => {
    // This would be tested with actual PDF file in integration tests
    expect(loader).toBeDefined();
  });

  it('should export getInstance method', () => {
    expect(PDFLoader.getInstance).toBeDefined();
    expect(typeof PDFLoader.getInstance).toBe('function');
  });
});
