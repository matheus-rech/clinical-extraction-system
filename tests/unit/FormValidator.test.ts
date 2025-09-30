/**
 * Unit Tests for FormValidator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FormValidator } from '@modules/form/FormValidator';

describe('FormValidator', () => {
  let validator: FormValidator;

  beforeEach(() => {
    validator = new FormValidator();
  });

  describe('DOI validation', () => {
    it('should validate correct DOI format', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.validation = 'doi';
      input.value = '10.1234/test.doi.2023';

      const result = validator.validateField(input);
      expect(result).toBe(true);
    });

    it('should reject invalid DOI format', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.validation = 'doi';
      input.value = 'invalid-doi';

      const result = validator.validateField(input);
      expect(result).toBe(false);
    });

    it('should accept DOI with special characters', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.validation = 'doi';
      input.value = '10.1234/test-doi_2023.v1';

      const result = validator.validateField(input);
      expect(result).toBe(true);
    });
  });

  describe('PMID validation', () => {
    it('should validate numeric PMID', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.validation = 'pmid';
      input.value = '12345678';

      const result = validator.validateField(input);
      expect(result).toBe(true);
    });

    it('should reject non-numeric PMID', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.validation = 'pmid';
      input.value = 'abc123';

      const result = validator.validateField(input);
      expect(result).toBe(false);
    });
  });

  describe('Year validation', () => {
    it('should validate reasonable year', () => {
      const input = document.createElement('input');
      input.type = 'number';
      input.dataset.validation = 'year';
      input.value = '2023';

      const result = validator.validateField(input);
      expect(result).toBe(true);
    });

    it('should reject year before 1900', () => {
      const input = document.createElement('input');
      input.type = 'number';
      input.dataset.validation = 'year';
      input.value = '1850';

      const result = validator.validateField(input);
      expect(result).toBe(false);
    });

    it('should accept year up to 2100', () => {
      const input = document.createElement('input');
      input.type = 'number';
      input.dataset.validation = 'year';
      input.value = '2100';

      const result = validator.validateField(input);
      expect(result).toBe(true);
    });

    it('should reject year after 2100', () => {
      const input = document.createElement('input');
      input.type = 'number';
      input.dataset.validation = 'year';
      input.value = '2101';

      const result = validator.validateField(input);
      expect(result).toBe(false);
    });
  });

  describe('General validation', () => {
    it('should pass fields without validation attribute', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = 'any text';

      const result = validator.validateField(input);
      expect(result).toBe(true);
    });

    it('should handle empty optional fields', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.validation = 'doi';
      input.value = '';

      const result = validator.validateField(input);
      expect(result).toBe(true); // Empty is valid for optional fields
    });
  });
});
