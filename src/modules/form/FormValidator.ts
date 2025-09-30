/**
 * Form Validation Module
 * Handles field-level and form-level validation
 */

import { SecurityUtils } from '@core/SecurityUtils';

export class FormValidator {
  validateField(input: HTMLInputElement | HTMLTextAreaElement): boolean {
    const result = SecurityUtils.validateInput(input);

    if (result.valid) {
      input.classList.remove('validation-error');
      const message = input.nextElementSibling;
      if (message && message.classList.contains('validation-message')) {
        message.textContent = '';
        (message as HTMLElement).style.display = 'none';
      }
    } else {
      input.classList.add('validation-error');
      const message = input.nextElementSibling;
      if (message && message.classList.contains('validation-message')) {
        message.textContent = result.message || 'Invalid input';
        (message as HTMLElement).style.display = 'block';
      }
    }

    return result.valid;
  }

  validateStep(stepElement: Element): boolean {
    const inputs = stepElement.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      '[data-validation]'
    );
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }
}
