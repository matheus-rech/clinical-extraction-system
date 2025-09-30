/**
 * Centralized Error Handling
 * Provides consistent error logging and user feedback
 */

import { StatusManager } from '@modules/ui/StatusManager';

export class ErrorHandler {
  /**
   * Log error to console and monitoring service
   */
  static logError(error: Error | unknown, context: string = ''): void {
    console.error(`[${context}] Error:`, error);

    // Send to monitoring service in production
    if (window.location.hostname !== 'localhost') {
      this.sendToMonitoring(error, context);
    }
  }

  /**
   * Send error to monitoring service
   * Configure your error tracking service here (Sentry, LogRocket, etc.)
   */
  private static sendToMonitoring(error: Error | unknown, context: string): void {
    // Implementation example for Sentry:
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     tags: { context },
    //     level: 'error'
    //   });
    // }
    
    // For now, just log that monitoring would be called
    if (process.env.NODE_ENV === 'production') {
      console.info('[Monitoring] Error would be sent to tracking service:', { error, context });
    }
  }

  /**
   * Wrap async function with error handling
   */
  static async wrapAsync<T>(
    fn: () => Promise<T>,
    context: string = ''
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.logError(error, context);
      throw error;
    }
  }

  /**
   * Handle PDF-specific errors with user-friendly messages
   */
  static handlePDFError(error: any): null {
    let message = 'Failed to process PDF';

    if (error?.name === 'InvalidPDFException') {
      message = 'Invalid or corrupted PDF file';
    } else if (error?.name === 'MissingPDFException') {
      message = 'PDF file not found';
    } else if (error?.name === 'PasswordException') {
      message = 'PDF is password protected';
    } else if (error?.message) {
      message = `PDF error: ${error.message}`;
    }

    StatusManager.show(message, 'error');
    this.logError(error, 'PDFError');
    return null;
  }

  /**
   * Handle form validation errors
   */
  static handleValidationError(fieldName: string, message: string): void {
    StatusManager.show(`Validation error in ${fieldName}: ${message}`, 'warning');
    this.logError(new Error(message), `Validation:${fieldName}`);
  }
}
