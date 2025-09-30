/**
 * Dynamic Fields Module
 * Handles creation and management of dynamic form fields
 */

export class DynamicFields {
  private counters = {
    indication: 0,
    intervention: 0,
    arm: 0,
    mortality: 0,
    mrs: 0,
    complication: 0,
    predictor: 0
  };

  initialize(): void {
    // Expose methods to window for onclick handlers
    (window as any).addIndication = () => this.addIndication();
    (window as any).addIntervention = () => this.addIntervention();
    (window as any).addArm = () => this.addArm();
    (window as any).addMortality = () => this.addMortality();
    (window as any).addMRS = () => this.addMRS();
    (window as any).addComplication = () => this.addComplication();
    (window as any).addPredictor = () => this.addPredictor();
    (window as any).removeElement = (button: HTMLButtonElement) => this.removeElement(button);
    this.setupWindowFunctions();
  }

  private removeElement(button: HTMLButtonElement): void {
    button.parentElement?.remove();
    this.updateArmSelectors();
  }

  addIndication(): void {
    const container = document.getElementById('indications-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'dynamic-container';
    div.innerHTML = `
      <h4>Indication</h4>
      <div class="grid-2col">
        <div class="form-group">
          <label>Sign/Symptom</label>
          <select name="indication_sign_${this.counters.indication}" class="linked-input">
            <option value="">Select...</option>
            <option value="Drowsiness">Drowsiness</option>
            <option value="GCS_Drop">Drop in GCS</option>
            <option value="Imaging_Mass_Effect">Imaging signs of mass effect</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Count (N)</label>
          <input type="number" name="indication_count_${this.counters.indication}" class="linked-input">
        </div>
      </div>
      <button type="button" class="remove-btn" onclick="removeElement(this)">Remove</button>
    `;
    container.appendChild(div);
    this.counters.indication++;
    
    // Trigger event for form field initialization
    document.dispatchEvent(new Event('dynamic-fields-added'));
  }

  addIntervention(): void {
    const container = document.getElementById('interventions-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'dynamic-container';
    div.innerHTML = `
      <h4>Intervention Type</h4>
      <div class="form-group">
        <label>Surgical Type</label>
        <select name="intervention_type_${this.counters.intervention}" class="linked-input">
          <option value="">Select...</option>
          <option value="SDC_EVD">SDC + EVD</option>
          <option value="SDC_ALONE">SDC Alone</option>
          <option value="EVD_ALONE">EVD Alone</option>
        </select>
      </div>
      <div class="form-group">
        <label>Time To Surgery (Hours)</label>
        <input type="number" step="0.1" name="intervention_time_${this.counters.intervention}" class="linked-input">
      </div>
      <div class="form-group">
        <label>Duraplasty?</label>
        <select name="intervention_duraplasty_${this.counters.intervention}" class="linked-input">
          <option value="null">Unknown</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </div>
      <button type="button" class="remove-btn" onclick="removeElement(this)">Remove</button>
    `;
    container.appendChild(div);
    this.counters.intervention++;
    document.dispatchEvent(new Event('dynamic-fields-added'));
  }

  addArm(): void {
    const container = document.getElementById('arms-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'dynamic-container arm-definition';
    div.innerHTML = `
      <h3>Study Arm</h3>
      <div class="grid-2col">
        <div class="form-group">
          <label>Label</label>
          <input type="text" name="arm_label_${this.counters.arm}" class="linked-input arm-label-input" oninput="updateArmSelectors()">
        </div>
        <div class="form-group">
          <label>Sample Size (N)</label>
          <input type="number" name="arm_n_${this.counters.arm}" class="linked-input">
        </div>
      </div>
      <button type="button" class="remove-btn" onclick="removeElement(this)">Remove</button>
    `;
    container.appendChild(div);
    this.counters.arm++;
    this.updateArmSelectors();
    document.dispatchEvent(new Event('dynamic-fields-added'));
  }

  // Expose updateArmSelectors to window for oninput handlers
  private setupWindowFunctions(): void {
    (window as any).updateArmSelectors = () => this.updateArmSelectors();
  }

  updateArmSelectors(): void {
    const armLabels = Array.from(document.querySelectorAll('.arm-label-input'))
      .map(input => (input as HTMLInputElement).value)
      .filter(Boolean);
    
    document.querySelectorAll('.arm-selector').forEach(select => {
      const htmlSelect = select as HTMLSelectElement;
      const currentValue = htmlSelect.value;
      htmlSelect.innerHTML = '<option value="">Select Arm...</option>';
      armLabels.forEach(label => {
        htmlSelect.add(new Option(label, label));
      });
      if (armLabels.includes(currentValue)) {
        htmlSelect.value = currentValue;
      }
    });
  }

  addMortality(): void {
    const container = document.getElementById('mortality-global-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'dynamic-container';
    div.innerHTML = `
      <h4>Mortality Data Point</h4>
      <div class="grid-2col">
        <div class="form-group">
          <label>Arm</label>
          <select name="mortality_arm_${this.counters.mortality}" class="arm-selector"></select>
        </div>
        <div class="form-group">
          <label>Timepoint</label>
          <input type="text" name="mortality_tp_${this.counters.mortality}" class="linked-input">
        </div>
      </div>
      <div class="grid-2col">
        <div class="form-group">
          <label>Deaths (N)</label>
          <input type="number" name="mortality_deaths_${this.counters.mortality}" class="linked-input">
        </div>
        <div class="form-group">
          <label>Total (N)</label>
          <input type="number" name="mortality_total_${this.counters.mortality}" class="linked-input">
        </div>
      </div>
      <button type="button" class="remove-btn" onclick="removeElement(this)">Remove</button>
    `;
    container.appendChild(div);
    this.counters.mortality++;
    this.updateArmSelectors();
    document.dispatchEvent(new Event('dynamic-fields-added'));
  }

  addMRS(): void {
    const container = document.getElementById('mrs-global-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'dynamic-container';
    div.innerHTML = `
      <h4>mRS Data Point</h4>
      <div class="grid-2col">
        <div class="form-group">
          <label>Arm</label>
          <select name="mrs_arm_${this.counters.mrs}" class="arm-selector"></select>
        </div>
        <div class="form-group">
          <label>Timepoint</label>
          <input type="text" name="mrs_tp_${this.counters.mrs}" class="linked-input">
        </div>
      </div>
      <h5>Distribution (Counts)</h5>
      <div class="grid-mrs">
        ${[0,1,2,3,4,5,6].map(i => `
          <div class="form-group">
            <label>${i}</label>
            <input type="number" name="mrs_${i}_${this.counters.mrs}" class="linked-input">
          </div>
        `).join('')}
      </div>
      <button type="button" class="remove-btn" onclick="removeElement(this)">Remove</button>
    `;
    container.appendChild(div);
    this.counters.mrs++;
    this.updateArmSelectors();
    document.dispatchEvent(new Event('dynamic-fields-added'));
  }

  addComplication(): void {
    const container = document.getElementById('complications-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'dynamic-container';
    div.innerHTML = `
      <h4>Complication</h4>
      <div class="grid-2col">
        <div class="form-group">
          <label>Description</label>
          <input type="text" name="comp_desc_${this.counters.complication}" class="linked-input">
        </div>
        <div class="form-group">
          <label>Arm</label>
          <select name="comp_arm_${this.counters.complication}" class="arm-selector"></select>
        </div>
      </div>
      <div class="form-group">
        <label>Count (N)</label>
        <input type="number" name="comp_count_${this.counters.complication}" class="linked-input">
      </div>
      <button type="button" class="remove-btn" onclick="removeElement(this)">Remove</button>
    `;
    container.appendChild(div);
    this.counters.complication++;
    this.updateArmSelectors();
    document.dispatchEvent(new Event('dynamic-fields-added'));
  }

  addPredictor(): void {
    const container = document.getElementById('predictors-container');
    if (!container) return;

    const div = document.createElement('div');
    div.className = 'dynamic-container';
    div.innerHTML = `
      <h4>Predictor Analysis</h4>
      <div class="form-group">
        <label>Predictor Variable</label>
        <input type="text" name="pred_var_${this.counters.predictor}" class="linked-input">
      </div>
      <div class="grid-3col">
        <div class="form-group">
          <label>Effect Size (OR/HR)</label>
          <input type="number" step="0.01" name="pred_effect_${this.counters.predictor}" class="linked-input">
        </div>
        <div class="form-group">
          <label>95% CI (Lower)</label>
          <input type="number" step="0.01" name="pred_ci_lower_${this.counters.predictor}" class="linked-input">
        </div>
        <div class="form-group">
          <label>95% CI (Upper)</label>
          <input type="number" step="0.01" name="pred_ci_upper_${this.counters.predictor}" class="linked-input">
        </div>
      </div>
      <div class="form-group">
        <label>p-Value</label>
        <input type="number" step="0.001" name="pred_pvalue_${this.counters.predictor}" class="linked-input">
      </div>
      <button type="button" class="remove-btn" onclick="removeElement(this)">Remove</button>
    `;
    container.appendChild(div);
    this.counters.predictor++;
    document.dispatchEvent(new Event('dynamic-fields-added'));
  }
}
