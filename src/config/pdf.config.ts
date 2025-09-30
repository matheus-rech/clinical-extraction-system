/**
 * PDF.js Configuration
 */

// Use the bundled worker from node_modules
export const PDFConfig = {
  workerSrc: new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).href,
  
  documentOptions: {
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
    password: '' // Can be extended for password-protected PDFs
  }
};
