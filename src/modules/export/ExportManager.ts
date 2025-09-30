/**
 * Export Manager Module
 * Handles data export in multiple formats
 */

import type { ExportData } from '../../types/extraction.types';
import AppStateManager from '@core/AppState';
import { ExtractionTracker } from '@modules/extraction/ExtractionTracker';
import { StatusManager } from '@modules/ui/StatusManager';
import { MemoryManager } from '@core/MemoryManager';

export class ExportManager {
  private tracker: ExtractionTracker;
  private memoryManager: MemoryManager;

  constructor() {
    this.tracker = ExtractionTracker.getInstance();
    this.memoryManager = MemoryManager.getInstance();
  }

  private collectFormData(): Record<string, string> {
    const formData: Record<string, string> = {};
    const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      '#extraction-form input, #extraction-form textarea, #extraction-form select'
    );
    
    inputs.forEach(input => {
      if (input.value) {
        formData[input.name || input.id] = input.value;
      }
    });
    
    return formData;
  }

  exportJSON(): void {
    try {
      const state = AppStateManager.getState();
      const exportData: ExportData = {
        document: state.documentName,
        exportDate: new Date().toISOString(),
        formData: this.collectFormData(),
        extractions: this.tracker.getExtractions()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      this.downloadFile(blob, `extraction_${Date.now()}.json`);
      StatusManager.show('JSON export successful', 'success');
    } catch (error) {
      console.error('Export JSON failed:', error);
      StatusManager.show('JSON export failed', 'error');
    }
  }

  exportCSV(): void {
    try {
      let csv = 'Field,Text,Page,X,Y,Width,Height,Timestamp\n';

      const extractions = this.tracker.getExtractions();
      extractions.forEach(ext => {
        csv += `"${ext.fieldName}","${ext.text.replace(/"/g, '""')}",${ext.page},`;
        csv += `${ext.coordinates.x},${ext.coordinates.y},${ext.coordinates.width},${ext.coordinates.height},`;
        csv += `"${ext.timestamp}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv' });
      this.downloadFile(blob, `extraction_${Date.now()}.csv`);
      StatusManager.show('CSV export successful', 'success');
    } catch (error) {
      console.error('Export CSV failed:', error);
      StatusManager.show('CSV export failed', 'error');
    }
  }

  exportAudit(): void {
    try {
      const formData = this.collectFormData();
      const html = this.generateAuditHTML(formData);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      const timeoutId = window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      this.memoryManager.registerTimeout(timeoutId);
      
      StatusManager.show('Audit report generated', 'success');
    } catch (error) {
      console.error('Export audit failed:', error);
      StatusManager.show('Audit export failed', 'error');
    }
  }

  private generateAuditHTML(formData: Record<string, string>): string {
    const state = AppStateManager.getState();
    const extractions = this.tracker.getExtractions();

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Clinical Extraction Audit Report</title>
      <style>
        body { font-family: Arial; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #1976D2; border-bottom: 2px solid #1976D2; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f5f5f5; padding: 10px; text-align: left; border: 1px solid #ddd; }
        td { padding: 10px; border: 1px solid #ddd; }
        .extraction { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .coordinates { font-family: monospace; background: #fff; padding: 5px; }
      </style>
    </head>
    <body>
      <h1>Clinical Study Extraction Audit Report</h1>
      
      <h2>Document Information</h2>
      <table>
        <tr><th>Document Name</th><td>${state.documentName || 'N/A'}</td></tr>
        <tr><th>Total Pages</th><td>${state.totalPages}</td></tr>
        <tr><th>Total Extractions</th><td>${extractions.length}</td></tr>
        <tr><th>Report Generated</th><td>${new Date().toLocaleString()}</td></tr>
      </table>
      
      <h2>Extracted Form Data</h2>
      <table>
        <tr><th>Field</th><th>Value</th></tr>
        ${Object.entries(formData).map(([key, value]) => 
          `<tr><td>${key}</td><td>${value}</td></tr>`
        ).join('')}
      </table>
      
      <h2>Extraction Details with Coordinates</h2>
      ${extractions.map((ext, i) => `
        <div class="extraction">
          <h3>${i + 1}. ${ext.fieldName}</h3>
          <p><strong>Extracted Text:</strong> "${ext.text}"</p>
          <p><strong>Page:</strong> ${ext.page}</p>
          <p><strong>Coordinates:</strong> 
            <span class="coordinates">X: ${ext.coordinates.x}, Y: ${ext.coordinates.y}, 
            Width: ${ext.coordinates.width}px, Height: ${ext.coordinates.height}px</span>
          </p>
          <p><strong>Timestamp:</strong> ${new Date(ext.timestamp).toLocaleString()}</p>
        </div>
      `).join('')}
      
      <div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd;">
        <p><em>This audit report provides complete traceability for all extracted data. 
        Each extraction includes precise coordinate information for verification against 
        the source document.</em></p>
      </div>
    </body>
    </html>
    `;
  }

  exportAnnotatedPDF(): void {
    StatusManager.show('Annotated PDF export requires additional libraries (e.g., pdf-lib)', 'info');
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    const timeoutId = window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    this.memoryManager.registerTimeout(timeoutId);
  }
}
