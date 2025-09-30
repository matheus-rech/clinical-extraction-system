/**
 * Security and Validation Utilities
 * Handles text sanitization, validation, and secure data encoding
 */

import type { Extraction, ValidationResult } from '../types/extraction.types';

export class SecurityUtils {
  /**
   * Sanitize extracted text to prevent XSS attacks
   */
  static sanitizeText(text: string): string {
    if (!text) return '';

    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML
      .replace(/[<>]/g, '')
      .trim()
      .substring(0, 10000); // Limit length to prevent DoS
  }

  /**
   * Validate extraction object structure and data
   */
  static validateExtraction(extraction: Partial<Extraction>): boolean {
    if (!extraction || typeof extraction !== 'object') return false;
    if (!extraction.fieldName || !extraction.text) return false;
    if (!extraction.coordinates ||
        extraction.coordinates.x < 0 ||
        extraction.coordinates.y < 0 ||
        extraction.coordinates.width <= 0 ||
        extraction.coordinates.height <= 0) return false;
    if (!extraction.page || extraction.page < 1) return false;
    return true;
  }

  /**
   * Escape HTML for safe display
   */
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Validate form input based on validation type
   */
  static validateInput(input: HTMLInputElement | HTMLTextAreaElement): ValidationResult {
    const validationType = input.dataset.validation;
    if (!validationType) return { valid: true };

    const value = input.value.trim();
    const validations = validationType.split(',');

    for (const validation of validations) {
      if (validation === 'required' && !value) {
        return { valid: false, message: 'This field is required' };
      }

      if (validation.startsWith('minLength:')) {
        const minLength = parseInt(validation.split(':')[1]);
        if (value.length < minLength) {
          return { valid: false, message: `Minimum length is ${minLength} characters` };
        }
      }

      if (validation === 'doi' && value) {
        const doiRegex = /^10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+$/;
        if (!doiRegex.test(value)) {
          return { valid: false, message: 'Invalid DOI format' };
        }
      }

      if (validation === 'pmid' && value) {
        if (!/^\d+$/.test(value)) {
          return { valid: false, message: 'PMID must be numeric' };
        }
      }

      if (validation === 'year' && value) {
        const year = parseInt(value);
        if (isNaN(year) || year < 1900 || year > 2100) {
          return { valid: false, message: 'Invalid year' };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Encode data for secure localStorage storage
   */
  static encodeData(data: any): string | null {
    try {
      return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    } catch (e) {
      console.error('Encoding failed:', e);
      return null;
    }
  }

  /**
   * Decode data from localStorage
   */
  static decodeData(encodedData: string): any | null {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(encodedData))));
    } catch (e) {
      console.error('Decoding failed:', e);
      return null;
    }
  }
}
