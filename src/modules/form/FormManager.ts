/**
 * Form Management Module
 * Handles multi-step form navigation and field management
 */

import AppStateManager from '@core/AppState';
import { MemoryManager } from '@core/MemoryManager';
import { StatusManager } from '@modules/ui/StatusManager';
import { dataSyncService } from '@modules/data/DataSyncService';
import { SupabaseConfigurationError } from '@config/supabase.config';
import { FormValidator } from './FormValidator';
import { DynamicFields } from './DynamicFields';

export class FormManager {
  private validator: FormValidator;
  private dynamicFields: DynamicFields;
  private memoryManager: MemoryManager;

  constructor() {
    this.validator = new FormValidator();
    this.dynamicFields = new DynamicFields();
    this.memoryManager = MemoryManager.getInstance();
  }

  initialize(): void {
    this.initializeFormFields();
    this.initializeNavigation();
    this.dynamicFields.initialize();
    this.showStep(0);
  }

  private initializeFormFields(): void {
    const inputs = document.querySelectorAll('.linked-input');
    
    inputs.forEach(input => {
      const handleFocus = () => {
        // Remove active state from all form groups
        document.querySelectorAll('.form-group').forEach(g => {
          g.classList.remove('active-extraction');
        });

        const fieldName = (input as HTMLInputElement).name || (input as HTMLInputElement).id;
        AppStateManager.setState({
          activeField: fieldName,
          activeFieldElement: input as HTMLElement
        });

        // Highlight current field's form group
        input.parentElement?.classList.add('active-extraction');

        // Update indicator
        const indicator = document.getElementById('active-field-indicator');
        if (indicator) {
          indicator.textContent = `Extracting: ${fieldName}`;
          indicator.style.background = '#4CAF50';
        }
      };

      const handleBlur = () => {
        this.validator.validateField(input as HTMLInputElement | HTMLTextAreaElement);
      };

      this.memoryManager.registerEventListener(input, 'focus', handleFocus);
      this.memoryManager.registerEventListener(input, 'blur', handleBlur);
    });
  }

  private initializeNavigation(): void {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    if (prevBtn) {
      this.memoryManager.registerEventListener(prevBtn, 'click', () => this.previousStep());
    }

    if (nextBtn) {
      this.memoryManager.registerEventListener(nextBtn, 'click', () => this.nextStep());
    }

    if (submitBtn) {
      this.memoryManager.registerEventListener(submitBtn, 'click', (e) => {
        void this.handleSubmit(e);
      });
    }
  }

  private showStep(stepIndex: number): void {
    const steps = document.querySelectorAll('.step');
    const state = AppStateManager.getState();

    steps.forEach((step, index) => {
      step.classList.toggle('active', index === stepIndex);
    });

    const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
    const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
    const stepIndicator = document.getElementById('step-indicator');
    const progressBar = document.getElementById('progress-bar');

    if (prevBtn) prevBtn.disabled = (stepIndex === 0);
    if (stepIndicator) stepIndicator.textContent = `Step ${stepIndex + 1} of ${state.totalSteps}`;

    const isLastStep = stepIndex === state.totalSteps - 1;
    if (nextBtn) nextBtn.style.display = isLastStep ? 'none' : 'inline-block';
    if (submitBtn) submitBtn.style.display = isLastStep ? 'inline-block' : 'none';

    // Scroll to top
    const formPanel = document.querySelector('.form-panel');
    if (formPanel) formPanel.scrollTop = 0;

    // Update progress bar
    if (progressBar) {
      const progress = ((stepIndex + 1) / state.totalSteps) * 100;
      progressBar.style.width = progress + '%';
    }

    // Update arm selectors if on relevant steps
    if (stepIndex >= 6) {
      this.dynamicFields.updateArmSelectors();
    }

    // Re-initialize form fields for dynamic content
    this.initializeFormFields();
  }

  nextStep(): void {
    const state = AppStateManager.getState();
    const steps = document.querySelectorAll('.step');
    const currentStepElement = steps[state.currentStep];

    // Validate required fields
    const requiredInputs = currentStepElement.querySelectorAll('[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
      const htmlInput = input as HTMLInputElement | HTMLTextAreaElement;
      if (!htmlInput.value) {
        isValid = false;
        htmlInput.style.borderColor = 'red';
      } else {
        htmlInput.style.borderColor = '';
      }
    });

    if (!isValid) {
      StatusManager.show('Please fill required fields', 'warning');
      return;
    }

    // Check inclusion criteria on step 2
    if (state.currentStep === 1) {
      const inclusionMet = (document.getElementById('inclusion-met') as HTMLSelectElement)?.value;
      if (inclusionMet === 'false') {
        if (confirm('Study does not meet inclusion criteria. Stop extraction?')) {
          return;
        }
      }
    }

    if (state.currentStep < state.totalSteps - 1) {
      const newStep = state.currentStep + 1;
      AppStateManager.setState({ currentStep: newStep });
      this.showStep(newStep);
    }
  }

  previousStep(): void {
    const state = AppStateManager.getState();
    
    if (state.currentStep > 0) {
      AppStateManager.setState({ currentStep: state.currentStep - 1 });
      this.showStep(state.currentStep - 1);
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const formData = this.collectFormData();
    const state = AppStateManager.getState();

    try {
      console.log('Final Extraction Data:', formData);
      const submissionId = await dataSyncService.persistCurrentSession(formData);
      console.log('Supabase submission id:', submissionId);
      console.log('Extraction Trace:', state.extractions);

      StatusManager.show(
        submissionId
          ? `Extraction complete! Saved to Supabase (ID: ${submissionId}).`
          : 'Extraction complete! Supabase saved without ID response.',
        'success'
      );
    } catch (error) {
      console.error('Failed to persist extraction session', error);

      if (error instanceof SupabaseConfigurationError) {
        StatusManager.show('Extraction complete locally. Configure Supabase to sync data.', 'warning');
      } else {
        StatusManager.show('Extraction saved locally, but Supabase sync failed. Please export manually.', 'error');
      }
    }
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
}
