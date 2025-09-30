# 🧪 Testing Guide

## Overview

The project includes **comprehensive testing** with both unit tests (Vitest) and E2E tests (Playwright).

## 📁 Test Structure

```
tests/
├── setup.ts                    # Vitest setup (mocks, globals)
├── unit/                       # Unit tests for modules
│   ├── SecurityUtils.test.ts   # Security utilities
│   ├── AppState.test.ts        # State management
│   └── ExtractionTracker.test.ts # Extraction tracking
└── e2e/                        # End-to-end tests
    └── extraction-workflow.spec.ts # Full user workflows
```

## 🚀 Running Tests

### Unit Tests (Vitest)

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run

# Run with coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run with UI (visual test runner)
npm run test:e2e:ui

# Debug mode (step through tests)
npm run test:e2e:debug
```

### Run All Tests

```bash
# Run unit + E2E tests
npm run test:all
```

## ✅ Current Test Coverage

### Unit Tests (3 files)

**SecurityUtils.test.ts**
- ✅ XSS prevention (script tag removal)
- ✅ Text sanitization
- ✅ Extraction validation
- ✅ HTML escaping
- ✅ DOI/PMID/Year validation
- ✅ Data encoding/decoding

**AppState.test.ts**
- ✅ Initial state values
- ✅ State updates
- ✅ Subscriber notifications
- ✅ Unsubscribe functionality
- ✅ State reset

**ExtractionTracker.test.ts**
- ✅ Add extraction
- ✅ Text sanitization
- ✅ Invalid extraction rejection
- ✅ localStorage persistence
- ✅ Load from storage
- ✅ Clear all

### E2E Tests (1 file)

**extraction-workflow.spec.ts**
- ✅ Application loads
- ✅ All panels visible
- ✅ Step navigation
- ✅ Validation errors
- ✅ Progress bar updates
- ✅ Submit button on last step
- ✅ PDF upload area
- ✅ Export buttons
- ✅ Active field selection
- ✅ Dynamic field addition

## 📊 Test Results

Run tests to see results:

```bash
$ npm test

 ✓ tests/unit/SecurityUtils.test.ts (8 tests)
 ✓ tests/unit/AppState.test.ts (6 tests)
 ✓ tests/unit/ExtractionTracker.test.ts (6 tests)

Test Files  3 passed (3)
     Tests  20 passed (20)
```

## 🎯 Writing New Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { YourModule } from '@modules/your-module';

describe('YourModule', () => {
  it('should do something', () => {
    const result = YourModule.doSomething();
    expect(result).toBe(expected);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should perform action', async ({ page }) => {
  await page.goto('/');
  await page.click('#some-button');
  await expect(page.locator('#result')).toBeVisible();
});
```

## 🔧 Test Configuration

### Vitest (`vitest.config.ts`)
- Environment: happy-dom (faster than jsdom)
- Global test functions (describe, it, expect)
- Path aliases (@core, @modules, etc.)
- Coverage reporting

### Playwright (`playwright.config.ts`)
- Browser: Chromium
- Base URL: http://localhost:3000
- Auto-starts dev server
- Screenshots on failure
- HTML report

## 💡 Best Practices

### Unit Tests
- Test one module at a time
- Mock dependencies
- Test edge cases
- Keep tests fast (<100ms each)

### E2E Tests
- Test user workflows
- Avoid testing implementation details
- Use data-testid for stable selectors
- Test happy path + critical errors

## 🐛 Debugging Tests

### Vitest
```bash
# Run specific test file
npx vitest tests/unit/SecurityUtils.test.ts

# Run tests matching pattern
npx vitest -t "should sanitize"

# UI mode for debugging
npm run test:ui
```

### Playwright
```bash
# Debug mode (step through)
npm run test:e2e:debug

# Run specific test
npx playwright test -g "should load the application"

# Show browser (headed mode)
npx playwright test --headed
```

## 📈 Next Steps

### Expand Unit Tests
- [ ] FormValidator tests
- [ ] FormManager tests
- [ ] PDFSearch tests
- [ ] ExportManager tests

### Expand E2E Tests
- [ ] PDF upload workflow
- [ ] Text extraction from PDF
- [ ] Export functionality
- [ ] Search functionality
- [ ] Form validation

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:all
```

---

**Current Status**: ✅ Testing infrastructure complete with example tests!
