/**
 * Global type declarations
 */

import type { ExportManager } from '@modules/export/ExportManager';
import type { SearchInterface } from '@modules/ui/SearchInterface';

declare global {
  interface Window {
    clinicalExtraction?: {
      exportJSON: () => void;
      exportCSV: () => void;
      exportAudit: () => void;
      searchInPDF: () => Promise<void>;
    };
  }

  // PDF.js global
  const pdfjsLib: any;
}

export {};
