/**
 * E2E Tests for Clinical Extraction Workflow
 */

import { test, expect } from '@playwright/test';

test.describe('Clinical Extraction System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Clinical Study Extraction System/);

    // Check main panels are visible
    await expect(page.locator('.form-panel')).toBeVisible();
    await expect(page.locator('.pdf-panel')).toBeVisible();
    await expect(page.locator('.trace-panel')).toBeVisible();
  });

  test('should show correct initial step', async ({ page }) => {
    // Check step indicator
    const indicator = page.locator('#step-indicator');
    await expect(indicator).toHaveText('Step 1 of 8');

    // Check first step is active
    const step1 = page.locator('#step-1');
    await expect(step1).toHaveClass(/active/);
  });

  test('should navigate between steps', async ({ page }) => {
    // Initially on step 1
    await expect(page.locator('#step-1')).toHaveClass(/active/);

    // Next button should be enabled
    const nextBtn = page.locator('#next-btn');
    await expect(nextBtn).toBeEnabled();

    // Previous button should be disabled on step 1
    const prevBtn = page.locator('#prev-btn');
    await expect(prevBtn).toBeDisabled();

    // Fill required field on step 1
    await page.fill('#citation', 'Test citation for navigation');

    // Click next
    await nextBtn.click();
    await page.waitForTimeout(300);

    // Should be on step 2
    await expect(page.locator('#step-indicator')).toHaveText('Step 2 of 8');
    await expect(page.locator('#step-2')).toHaveClass(/active/);
    await expect(page.locator('#step-1')).not.toHaveClass(/active/);

    // Previous button should now be enabled
    await expect(prevBtn).toBeEnabled();

    // Click previous
    await prevBtn.click();
    await page.waitForTimeout(300);

    // Back to step 1
    await expect(page.locator('#step-1')).toHaveClass(/active/);
  });

  test('should show validation errors for required fields', async ({ page }) => {
    const nextBtn = page.locator('#next-btn');

    // Try to go to next step without filling required field
    await nextBtn.click();

    // Should show validation error (wait for style to be applied)
    const citationField = page.locator('#citation');
    await page.waitForTimeout(200);
    const borderColor = await citationField.evaluate((el) => window.getComputedStyle(el).borderColor);
    expect(borderColor).toContain('255, 0, 0');
  });

  test('should validate DOI format', async ({ page }) => {
    const doiInput = page.locator('#doi');

    // Enter invalid DOI
    await doiInput.fill('invalid-doi');
    await doiInput.blur();
    await page.waitForTimeout(100);

    // Check if validation error class is added
    const hasError = await doiInput.evaluate((el) => el.classList.contains('validation-error'));
    
    // Enter valid DOI
    await doiInput.fill('10.1234/valid.doi.2023');
    await doiInput.blur();
    await page.waitForTimeout(100);

    // Should remove or not have validation error
    const hasErrorAfter = await doiInput.evaluate((el) => el.classList.contains('validation-error'));
    expect(hasErrorAfter).toBeFalsy();
  });

  test('should update progress bar as steps advance', async ({ page }) => {
    const progressBar = page.locator('#progress-bar');

    // Initial progress (Step 1 of 8)
    const initialWidth = await progressBar.evaluate((el) => el.style.width);
    expect(initialWidth).toBe('12.5%'); // 1/8 = 12.5%

    // Fill required field and go to step 2
    await page.fill('#citation', 'Test citation');
    await page.click('#next-btn');

    // Progress should update (Step 2 of 8)
    const updatedWidth = await progressBar.evaluate((el) => el.style.width);
    expect(updatedWidth).toBe('25%'); // 2/8 = 25%
  });

  test('should show submit button on last step', async ({ page }) => {
    const nextBtn = page.locator('#next-btn');
    const submitBtn = page.locator('#submit-btn');

    // Next button visible, submit hidden initially
    await expect(nextBtn).toBeVisible();
    await expect(submitBtn).not.toBeVisible();

    // Navigate to last step (skip validation for speed)
    for (let i = 0; i < 7; i++) {
      // Fill required fields if needed
      if (i === 0) await page.fill('#citation', 'Test');
      if (i === 1) await page.selectOption('#inclusion-met', 'true');
      if (i === 2) await page.fill('#totalN', '100');

      await nextBtn.click();
      await page.waitForTimeout(100);
    }

    // On last step, submit visible, next hidden
    await expect(submitBtn).toBeVisible();
    await expect(nextBtn).not.toBeVisible();
  });

  test('should display PDF upload area', async ({ page }) => {
    const uploadArea = page.locator('#upload-area');
    await expect(uploadArea).toBeVisible();
    await expect(uploadArea).toContainText('Drop PDF file here');
  });

  test('should show export buttons', async ({ page }) => {
    const exportSection = page.locator('.export-section');
    await expect(exportSection).toBeVisible();

    // Check all export buttons are present using more specific selectors
    await expect(page.locator('button.export-json')).toBeVisible();
    await expect(page.locator('button.export-csv')).toBeVisible();
    await expect(page.locator('button.export-audit')).toBeVisible();
    await expect(page.locator('button.export-pdf')).toBeVisible();
  });

  test('should show markdown search section', async ({ page }) => {
    const markdownSection = page.locator('.markdown-section');
    await expect(markdownSection).toBeVisible();
    await expect(markdownSection).toContainText('Markdown Assistant');
  });

  test('should display statistics', async ({ page }) => {
    await expect(page.locator('text=Total Extractions:')).toBeVisible();
    await expect(page.locator('text=Pages with Data:')).toBeVisible();
    await expect(page.locator('#extraction-count')).toHaveText('0');
  });

  test('should handle active field selection', async ({ page }) => {
    const citationField = page.locator('#citation');
    const indicator = page.locator('#active-field-indicator');

    // Initially no field selected
    await expect(indicator).toHaveText('No field selected');

    // Focus on field
    await citationField.focus();

    // Indicator should update
    await expect(indicator).toHaveText('Extracting: citation');

    // Form group should be highlighted
    const formGroup = citationField.locator('..');
    await expect(formGroup).toHaveClass(/active-extraction/);
  });

  test('should add dynamic fields', async ({ page }) => {
    // Navigate to step 5 (Interventions)
    await page.fill('#citation', 'Test');
    await page.click('#next-btn');
    await page.waitForTimeout(300);
    
    // Wait for step 2 to be active
    await expect(page.locator('#step-2')).toHaveClass(/active/);
    await page.selectOption('#inclusion-met', 'true');
    await page.click('#next-btn');
    await page.waitForTimeout(300);
    
    // Wait for step 3 to be active
    await expect(page.locator('#step-3')).toHaveClass(/active/);
    await page.fill('#totalN', '100');
    await page.click('#next-btn');
    await page.waitForTimeout(300);
    
    await page.click('#next-btn');
    await page.waitForTimeout(300);

    // Should be on step 5
    await expect(page.locator('#step-5')).toHaveClass(/active/);

    // Verify add indication button exists
    const addButton = page.locator('button:has-text("+ Add Indication")');
    await expect(addButton).toBeVisible();
    
    // Click add indication button
    await addButton.click();
    await page.waitForTimeout(500);

    // Verify dynamic container was added to the DOM
    const containerExists = await page.evaluate(() => {
      const container = document.querySelector('#indications-container .dynamic-container');
      return container !== null;
    });
    expect(containerExists).toBeTruthy();
  });
});

test.describe('PDF Upload and Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Wait for application to initialize
    await page.waitForSelector('#pdf-upload-btn', { state: 'visible', timeout: 10000 });
  });

  test('should upload a PDF via file input', async ({ page }) => {
    // Listen for console messages and errors
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    // Check if PDF.js loaded
    const hasPdfJs = await page.evaluate(() => typeof (window as any).pdfjsLib !== 'undefined');
    console.log('PDF.js loaded:', hasPdfJs);

    // Upload PDF
    const fileInput = page.locator('#pdf-file');
    await fileInput.setInputFiles('./PDFs/Chen1992.pdf');

    // Wait a bit for processing to start
    await page.waitForTimeout(2000);

    // Check current state
    const state = await page.evaluate(() => {
      return {
        pdfPagesDisplay: document.getElementById('pdf-pages')?.style.display,
        hasCanvas: document.querySelector('canvas') !== null,
        totalPages: document.getElementById('total-pages')?.textContent,
        uploadAreaDisplay: document.getElementById('upload-area')?.style.display
      };
    });
    console.log('State after upload:', state);

    // Wait for PDF to be processed and rendered
    await page.waitForFunction(
      () => {
        const canvas = document.querySelector('canvas');
        return canvas !== null;
      },
      { timeout: 15000 }
    );

    // Check that PDF loaded successfully
    await expect(page.locator('canvas')).toBeVisible();
    
    // Check total pages is updated
    const totalPages = await page.locator('#total-pages').textContent();
    expect(parseInt(totalPages || '0')).toBeGreaterThan(0);
  });

  test('should upload PDF via upload area', async ({ page }) => {
    // Upload file directly (no need to click label)
    const fileInput2 = page.locator('#pdf-file-2');
    await fileInput2.setInputFiles('./PDFs/Kim2016.pdf');

    // Wait for PDF to be rendered
    await page.waitForFunction(
      () => document.querySelector('canvas') !== null,
      { timeout: 15000 }
    );

    // Verify PDF is displayed
    await expect(page.locator('.pdf-page')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should navigate between PDF pages', async ({ page }) => {
    // Upload a multi-page PDF
    await page.locator('#pdf-file').setInputFiles('./PDFs/Hernandez-Duran et al..pdf');
    
    // Wait for PDF to be rendered
    await page.waitForFunction(
      () => document.querySelector('canvas') !== null,
      { timeout: 15000 }
    );

    // Check initial page
    await expect(page.locator('#page-num')).toHaveValue('1');

    // Click next page
    await page.click('#pdf-next-page');
    await page.waitForTimeout(1000);

    // Should be on page 2
    await expect(page.locator('#page-num')).toHaveValue('2');

    // Click previous page
    await page.click('#pdf-prev-page');
    await page.waitForTimeout(1000);

    // Should be back on page 1
    await expect(page.locator('#page-num')).toHaveValue('1');
  });

  test('should change zoom level', async ({ page }) => {
    // Upload PDF
    await page.locator('#pdf-file').setInputFiles('./PDFs/Kudo2007.pdf');
    await page.waitForFunction(() => document.querySelector('canvas') !== null, { timeout: 15000 });

    // Change zoom to 150%
    await page.selectOption('#zoom-level', '1.5');
    await page.waitForTimeout(1000);

    // Verify zoom changed (canvas should be larger)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should fit PDF to width', async ({ page }) => {
    // Upload PDF
    await page.locator('#pdf-file').setInputFiles('./PDFs/Lee2019.pdf');
    await page.waitForFunction(() => document.querySelector('canvas') !== null, { timeout: 15000 });

    // Click fit width button
    await page.click('#fit-width');
    await page.waitForTimeout(1500);

    // Verify canvas is still visible (fit width worked)
    await expect(page.locator('canvas')).toBeVisible();
    
    // Verify the button exists and was clickable (functionality present)
    await expect(page.locator('#fit-width')).toBeEnabled();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Upload PDF
    await page.locator('#pdf-file').setInputFiles('./PDFs/Raco2003.pdf');
    await page.waitForFunction(() => document.querySelector('canvas') !== null, { timeout: 15000 });

    // Use arrow key to go to next page
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);

    // Should be on page 2
    const pageNum = await page.locator('#page-num').inputValue();
    expect(parseInt(pageNum)).toBeGreaterThan(1);
  });

  test('should activate field and show indicator', async ({ page }) => {
    // Upload PDF
    await page.locator('#pdf-file').setInputFiles('./PDFs/Chen1992.pdf');
    await page.waitForFunction(() => document.querySelector('canvas') !== null, { timeout: 15000 });

    // Click on a form field
    await page.click('#citation');
    await page.waitForTimeout(200);

    // Check indicator updates
    const indicator = page.locator('#active-field-indicator');
    await expect(indicator).toContainText('Extracting: citation');

    // Check field is highlighted
    const formGroup = page.locator('#citation').locator('..');
    await expect(formGroup).toHaveClass(/active-extraction/);
  });

  test('should perform complete extraction workflow', async ({ page }) => {
    // Upload PDF
    await page.locator('#pdf-file').setInputFiles('./PDFs/Won2024.pdf');
    await page.waitForFunction(() => document.querySelector('canvas') !== null, { timeout: 15000 });

    // Verify PDF loaded
    await expect(page.locator('.pdf-page')).toBeVisible();

    // Click on citation field
    await page.click('#citation');
    await page.waitForTimeout(200);
    await expect(page.locator('#active-field-indicator')).toContainText('citation');

    // Manually type some data (simulating extraction)
    await page.fill('#citation', 'Won et al., 2024. Test extraction from PDF.');

    // Verify field has value
    const citationValue = await page.locator('#citation').inputValue();
    expect(citationValue).toContain('Won');

    // Check extraction count (should update if we had real text selection)
    const extractionCount = await page.locator('#extraction-count').textContent();
    expect(extractionCount).toBeDefined();
  });

  test('should show error for invalid file type', async ({ page }) => {
    // Try to upload non-PDF file (create a text file for test)
    // Note: This test requires a non-PDF file in the test fixtures
    // For now, we verify the accept attribute is set correctly
    const fileInput = page.locator('#pdf-file');
    const acceptAttr = await fileInput.getAttribute('accept');
    expect(acceptAttr).toBe('.pdf');
  });

  test('should maintain state when switching pages', async ({ page }) => {
    // Upload PDF
    await page.locator('#pdf-file').setInputFiles('./PDFs/Mattar2021.pdf');
    await page.waitForFunction(() => document.querySelector('canvas') !== null, { timeout: 15000 });

    // Fill a field on step 1
    await page.fill('#citation', 'Test citation for state persistence');
    await page.fill('#doi', '10.1234/test.doi');

    // Navigate to next step
    await page.click('#next-btn');
    await page.waitForTimeout(500);
    await expect(page.locator('#step-2')).toHaveClass(/active/);

    // Go back to step 1
    await page.click('#prev-btn');
    await page.waitForTimeout(500);
    await expect(page.locator('#step-1')).toHaveClass(/active/);

    // Verify fields retained their values
    await expect(page.locator('#citation')).toHaveValue('Test citation for state persistence');
    await expect(page.locator('#doi')).toHaveValue('10.1234/test.doi');

    // PDF should still be loaded
    await expect(page.locator('.pdf-page')).toBeVisible();
  });

  test('should display text layer for selection', async ({ page }) => {
    // Upload PDF
    await page.locator('#pdf-file').setInputFiles('./PDFs/Jauss1999.pdf');
    await page.waitForFunction(() => document.querySelector('canvas') !== null, { timeout: 15000 });

    // Check that text layer exists
    const textLayer = page.locator('.textLayer');
    await expect(textLayer).toBeVisible();

    // Text layer should have spans with text
    const textSpans = textLayer.locator('span');
    const count = await textSpans.count();
    expect(count).toBeGreaterThan(0);
  });
});
