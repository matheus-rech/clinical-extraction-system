/**
 * Application Entry Point
 * Initializes the application and exposes necessary global functions
 */

import './styles/main.scss';
import { Application } from './Application';

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

async function initialize(): Promise<void> {
  try {
    const app = new Application();
    await app.initialize();

    // Expose necessary functions to window for onclick handlers
    window.clinicalExtraction = {
      exportJSON: () => app.exportManager.exportJSON(),
      exportCSV: () => app.exportManager.exportCSV(),
      exportAudit: () => app.exportManager.exportAudit(),
      searchInPDF: () => app.searchInterface.searchInPDF()
    };

    // Expose functions directly for onclick handlers in HTML
    (window as any).exportJSON = () => app.exportManager.exportJSON();
    (window as any).exportCSV = () => app.exportManager.exportCSV();
    (window as any).exportAudit = () => app.exportManager.exportAudit();
    (window as any).exportAnnotatedPDF = () => app.exportManager.exportAnnotatedPDF();
    (window as any).toggleSearchInterface = () => app.searchInterface.toggleSearchInterface();
    (window as any).searchInPDF = () => app.searchInterface.searchInPDF();

    console.log('Clinical Extraction System initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    alert('Application initialization failed. Please refresh the page.');
  }
}
