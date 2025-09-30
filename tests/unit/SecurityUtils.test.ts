/**
 * Unit Tests for SecurityUtils
 */

import { describe, it, expect } from 'vitest';
import { SecurityUtils } from '@core/SecurityUtils';

describe('SecurityUtils', () => {
  describe('sanitizeText', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const result = SecurityUtils.sanitizeText(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
    });

    it('should remove angle brackets', () => {
      const input = 'Hello <tag> World';
      const result = SecurityUtils.sanitizeText(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should trim whitespace', () => {
      const input = '  Hello World  ';
      const result = SecurityUtils.sanitizeText(input);
      expect(result).toBe('Hello World');
    });

    it('should limit length to 10000 characters', () => {
      const input = 'a'.repeat(15000);
      const result = SecurityUtils.sanitizeText(input);
      expect(result.length).toBe(10000);
    });

    it('should handle empty strings', () => {
      expect(SecurityUtils.sanitizeText('')).toBe('');
      expect(SecurityUtils.sanitizeText(null as any)).toBe('');
    });
  });

  describe('validateExtraction', () => {
    it('should validate correct extraction', () => {
      const extraction = {
        id: 'test-123',
        timestamp: new Date().toISOString(),
        fieldName: 'citation',
        text: 'Test citation',
        page: 1,
        coordinates: { x: 10, y: 20, width: 100, height: 50 },
        method: 'manual' as const,
        documentName: 'test.pdf'
      };

      expect(SecurityUtils.validateExtraction(extraction)).toBe(true);
    });

    it('should reject extraction with negative coordinates', () => {
      const extraction = {
        fieldName: 'test',
        text: 'text',
        page: 1,
        coordinates: { x: -10, y: 20, width: 100, height: 50 }
      };

      expect(SecurityUtils.validateExtraction(extraction)).toBe(false);
    });

    it('should reject extraction with zero width', () => {
      const extraction = {
        fieldName: 'test',
        text: 'text',
        page: 1,
        coordinates: { x: 10, y: 20, width: 0, height: 50 }
      };

      expect(SecurityUtils.validateExtraction(extraction)).toBe(false);
    });

    it('should reject extraction without required fields', () => {
      expect(SecurityUtils.validateExtraction({})).toBe(false);
      expect(SecurityUtils.validateExtraction({ fieldName: 'test' })).toBe(false);
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      const input = '<div>Test & "quoted"</div>';
      const result = SecurityUtils.escapeHtml(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });
  });

  describe('validateInput', () => {
    it('should validate DOI format', () => {
      const input = document.createElement('input');
      input.dataset.validation = 'doi';
      
      input.value = '10.1234/test.2023';
      expect(SecurityUtils.validateInput(input).valid).toBe(true);
      
      input.value = 'invalid-doi';
      expect(SecurityUtils.validateInput(input).valid).toBe(false);
    });

    it('should validate PMID format', () => {
      const input = document.createElement('input');
      input.dataset.validation = 'pmid';
      
      input.value = '12345678';
      expect(SecurityUtils.validateInput(input).valid).toBe(true);
      
      input.value = 'abc123';
      expect(SecurityUtils.validateInput(input).valid).toBe(false);
    });

    it('should validate year range', () => {
      const input = document.createElement('input');
      input.dataset.validation = 'year';
      
      input.value = '2023';
      expect(SecurityUtils.validateInput(input).valid).toBe(true);
      
      input.value = '1800';
      expect(SecurityUtils.validateInput(input).valid).toBe(false);
      
      input.value = '2200';
      expect(SecurityUtils.validateInput(input).valid).toBe(false);
    });

    it('should validate required fields', () => {
      const input = document.createElement('input');
      input.dataset.validation = 'required';
      
      input.value = 'some value';
      expect(SecurityUtils.validateInput(input).valid).toBe(true);
      
      input.value = '';
      expect(SecurityUtils.validateInput(input).valid).toBe(false);
    });
  });

  describe('encodeData and decodeData', () => {
    it('should encode and decode data correctly', () => {
      const testData = { name: 'Test', value: 123, nested: { key: 'value' } };
      
      const encoded = SecurityUtils.encodeData(testData);
      expect(encoded).toBeTruthy();
      
      const decoded = SecurityUtils.decodeData(encoded!);
      expect(decoded).toEqual(testData);
    });

    it('should handle special characters', () => {
      const testData = { text: 'Special: "quotes" & <tags>' };
      const encoded = SecurityUtils.encodeData(testData);
      const decoded = SecurityUtils.decodeData(encoded!);
      expect(decoded).toEqual(testData);
    });
  });
});
