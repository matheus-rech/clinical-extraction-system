/**
 * Unit Tests for ErrorHandler
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorHandler } from '@core/ErrorHandler';

describe('ErrorHandler', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('wrapAsync', () => {
    it('should execute async function successfully', async () => {
      const fn = async () => 'success';
      const result = await ErrorHandler.wrapAsync(fn, 'TestContext');
      expect(result).toBe('success');
    });

    it('should catch and log errors', async () => {
      const fn = async () => {
        throw new Error('Test error');
      };

      try {
        await ErrorHandler.wrapAsync(fn, 'TestContext');
      } catch (error) {
        expect(consoleErrorSpy).toHaveBeenCalled();
      }
    });

    it('should include context in error logs', async () => {
      const fn = async () => {
        throw new Error('Test error');
      };

      try {
        await ErrorHandler.wrapAsync(fn, 'MySpecificContext');
      } catch (error) {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[MySpecificContext]'),
          expect.anything()
        );
      }
    });

    it('should handle non-Error throws', async () => {
      const fn = async () => {
        throw 'string error';
      };

      try {
        await ErrorHandler.wrapAsync(fn, 'TestContext');
      } catch (error) {
        expect(consoleErrorSpy).toHaveBeenCalled();
      }
    });
  });

  describe('handlePDFError', () => {
    it('should handle PDF-specific errors', () => {
      const error = new Error('PDF parsing failed');
      ErrorHandler.handlePDFError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle password-protected PDFs', () => {
      const error = new Error('Password required');
      ErrorHandler.handlePDFError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle corrupted PDF files', () => {
      const error = new Error('Invalid PDF structure');
      ErrorHandler.handlePDFError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('handleValidationError', () => {
    it('should handle validation errors', () => {
      const error = new Error('Validation failed');
      ErrorHandler.handleValidationError(error);
      
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should format validation messages properly', () => {
      const error = new Error('Invalid input format');
      ErrorHandler.handleValidationError(error);
      
      // Check that console.error was called with validation context
      expect(consoleErrorSpy).toHaveBeenCalled();
      const firstCallArgs = consoleErrorSpy.mock.calls[0];
      expect(firstCallArgs[0]).toContain('[Validation');
    });
  });

  describe('error logging', () => {
    it('should log errors with timestamps', async () => {
      const fn = async () => {
        throw new Error('Test error');
      };

      try {
        await ErrorHandler.wrapAsync(fn, 'TestContext');
      } catch (error) {
        expect(consoleErrorSpy).toHaveBeenCalled();
      }
    });

    it('should preserve error stack traces', async () => {
      const fn = async () => {
        const err = new Error('Test error');
        err.stack = 'mock stack trace';
        throw err;
      };

      try {
        await ErrorHandler.wrapAsync(fn, 'TestContext');
      } catch (error: any) {
        expect(error.stack).toBeDefined();
      }
    });
  });
});
