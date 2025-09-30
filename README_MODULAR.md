# Clinical Extraction System - Modular Architecture

🎉 **Successfully modularized from 2130 lines of monolithic HTML into a clean, maintainable TypeScript application!**

## 🏗️ Architecture Overview

The application has been transformed from a single HTML file into a modern, modular TypeScript application using **Vite** for blazing-fast development and production builds.

### Key Benefits

- ✅ **Type Safety**: Full TypeScript with strict mode enabled
- ✅ **Modular**: 20+ focused modules with clear responsibilities
- ✅ **Maintainable**: Easy to locate and fix issues
- ✅ **Scalable**: Simple to add new features
- ✅ **Performant**: Vite's HMR for instant feedback
- ✅ **Testable**: Each module can be unit tested independently

## 📁 Project Structure

```
clinical-extraction-system/
├── index.html                          # Minimal HTML structure
├── package.json                         # Dependencies & scripts
├── vite.config.ts                       # Vite configuration
├── tsconfig.json                        # TypeScript configuration
│
├── src/
│   ├── main.ts                          # Application entry point
│   ├── Application.ts                   # Main orchestrator class
│   │
│   ├── types/                           # TypeScript definitions
│   │   ├── extraction.types.ts          # Extraction interfaces
│   │   ├── pdf.types.ts                 # PDF-related types
│   │   └── index.d.ts                   # Global declarations
│   │
│   ├── core/                            # Core infrastructure
│   │   ├── AppState.ts                  # Global state management
│   │   ├── SecurityUtils.ts             # Sanitization & validation
│   │   ├── ErrorHandler.ts              # Error management
│   │   └── MemoryManager.ts             # Resource cleanup
│   │
│   ├── modules/                         # Feature modules
│   │   ├── pdf/
│   │   │   ├── PDFLoader.ts             # PDF file loading
│   │   │   ├── PDFRenderer.ts           # Page rendering
│   │   │   ├── TextSelection.ts         # Interactive selection
│   │   │   └── PDFSearch.ts             # Text search
│   │   │
│   │   ├── extraction/
│   │   │   └── ExtractionTracker.ts     # Extraction history
│   │   │
│   │   ├── form/
│   │   │   ├── FormManager.ts           # Multi-step navigation
│   │   │   ├── FormValidator.ts         # Field validation
│   │   │   └── DynamicFields.ts         # Dynamic form fields
│   │   │
│   │   ├── export/
│   │   │   └── ExportManager.ts         # JSON/CSV/Audit export
│   │   │
│   │   └── ui/
│   │       ├── StatusManager.ts         # User feedback
│   │       └── SearchInterface.ts       # Markdown search
│   │
│   ├── styles/                          # SCSS stylesheets
│   │   ├── main.scss                    # Main entry
│   │   ├── _variables.scss              # Colors, spacing
│   │   └── components/                  # Component styles
│   │       ├── _layout.scss
│   │       ├── _form.scss
│   │       ├── _pdf-viewer.scss
│   │       ├── _trace.scss
│   │       ├── _buttons.scss
│   │       └── _animations.scss
│   │
│   └── config/
│       └── pdf.config.ts                # PDF.js configuration
│
├── complete-clinical-extraction-system-enhanced.backup.html
│                                        # Original preserved
└── convex/                              # Backend (unchanged)
```

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server with HMR
npm run dev

# Opens at http://localhost:3000
```

### Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

### Convex Backend (Optional)

```bash
# Run Convex development server
npm run convex:dev

# Deploy Convex functions
npm run convex:deploy
```

## 🎯 Core Modules Explained

### AppState (State Management)

**Location**: `src/core/AppState.ts`

Centralized state management using the observer pattern. All modules subscribe to state changes for reactive updates.

```typescript
import AppStateManager from '@core/AppState';

// Get current state
const state = AppStateManager.getState();

// Update state
AppStateManager.setState({ currentPage: 5 });

// Subscribe to changes
const unsubscribe = AppStateManager.subscribe((state) => {
  console.log('State changed:', state);
});
```

### SecurityUtils (Validation)

**Location**: `src/core/SecurityUtils.ts`

Handles text sanitization, XSS prevention, and data validation.

```typescript
import { SecurityUtils } from '@core/SecurityUtils';

// Sanitize user input
const clean = SecurityUtils.sanitizeText(userInput);

// Validate extraction
if (SecurityUtils.validateExtraction(extraction)) {
  // Safe to proceed
}

// Validate form field
const result = SecurityUtils.validateInput(inputElement);
```

### PDFLoader & PDFRenderer

**Location**: `src/modules/pdf/`

Manages PDF loading and rendering with error handling and caching.

```typescript
import { PDFLoader } from '@modules/pdf/PDFLoader';
import { PDFRenderer } from '@modules/pdf/PDFRenderer';

const loader = PDFLoader.getInstance();
const renderer = new PDFRenderer();

await loader.loadPDF(file);
await renderer.renderPage(1);
```

### ExtractionTracker

**Location**: `src/modules/extraction/ExtractionTracker.ts`

Tracks all extractions with localStorage persistence.

```typescript
import { ExtractionTracker } from '@modules/extraction/ExtractionTracker';

const tracker = ExtractionTracker.getInstance();

// Add extraction
tracker.addExtraction({
  fieldName: 'citation',
  text: 'Extracted text...',
  page: 1,
  coordinates: { x: 100, y: 200, width: 300, height: 50 },
  method: 'manual',
  documentName: 'paper.pdf'
});

// Get all extractions
const extractions = tracker.getExtractions();
```

## 🛠️ Development Guidelines

### Adding New Modules

1. Create module file in appropriate directory (`src/modules/`)
2. Define TypeScript types in `src/types/`
3. Import and integrate in `src/Application.ts`
4. Add styles in `src/styles/components/`

### Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
// Instead of ../../core/AppState
import AppStateManager from '@core/AppState';

// Instead of ../../../modules/pdf/PDFLoader
import { PDFLoader } from '@modules/pdf/PDFLoader';
```

**Available aliases**:
- `@/` → `./src/`
- `@core/` → `./src/core/`
- `@modules/` → `./src/modules/`
- `@types/` → `./src/types/`
- `@styles/` → `./src/styles/`
- `@config/` → `./src/config/`

### Memory Management

The `MemoryManager` automatically tracks and cleans up resources:

```typescript
import { MemoryManager } from '@core/MemoryManager';

const memoryManager = MemoryManager.getInstance();

// Register event listener for cleanup
memoryManager.registerEventListener(button, 'click', handler);

// Register timeout for cleanup
const timeoutId = setTimeout(() => {}, 1000);
memoryManager.registerTimeout(timeoutId);
```

## 🎨 Styling System

The application uses **SCSS** with a modular component structure:

- **Variables**: Colors, spacing, transitions in `_variables.scss`
- **Components**: Each UI component has its own stylesheet
- **Responsive**: Mobile-friendly with flexbox/grid layouts

### Adding New Styles

1. Create component stylesheet in `src/styles/components/`
2. Import in `src/styles/main.scss`
3. Use SCSS variables for consistency

## 📦 Build Output

Production builds are optimized and include:

- ✅ Tree-shaking (removes unused code)
- ✅ Minification (smaller file sizes)
- ✅ Source maps (easier debugging)
- ✅ Asset optimization (images, fonts)
- ✅ Code splitting (faster initial load)

## 🔧 Configuration Files

### vite.config.ts

- Path aliases
- Dev server settings (port 3000)
- Build output configuration

### tsconfig.json

- Strict TypeScript mode
- Path mappings
- ES2020 target
- Module resolution

## 🧪 Testing (Future Enhancement)

Structure is ready for testing:

```bash
# (Not yet implemented)
npm test
```

Recommended testing stack:
- **Vitest**: Fast unit test runner
- **Testing Library**: Component testing
- **Playwright**: E2E testing

## 📝 Migration Notes

### What Changed

1. **Structure**: Monolithic HTML → Modular TypeScript
2. **Build**: No bundler → Vite with HMR
3. **Styles**: Inline CSS → SCSS modules
4. **State**: Global variables → Observer pattern
5. **Types**: No types → Full TypeScript

### What Stayed the Same

- ✅ All 8 form steps preserved
- ✅ PDF extraction functionality
- ✅ Markdown search feature
- ✅ Export to JSON/CSV/Audit
- ✅ localStorage persistence
- ✅ Convex backend integration ready

### Backward Compatibility

The original HTML file is preserved as:
```
complete-clinical-extraction-system-enhanced.backup.html
```

## 🚦 Next Steps

Potential enhancements:

1. **Convex Integration**: Connect form submission to backend
2. **Unit Tests**: Add Vitest test suite
3. **E2E Tests**: Playwright for full workflow testing
4. **CI/CD**: GitHub Actions for automated builds
5. **PWA**: Make it installable and offline-capable
6. **Accessibility**: WCAG 2.1 AA compliance
7. **Internationalization**: Multi-language support

## 🤝 Contributing

1. Create feature branch
2. Make changes in modular structure
3. Test with `npm run dev`
4. Build with `npm run build`
5. Submit pull request

## 📄 License

See LICENSE file

## 🙏 Acknowledgments

- Built with **Vite** for incredible DX
- **PDF.js** for PDF rendering
- **TypeScript** for type safety
- **SCSS** for powerful styling

---

**Modularization Complete** ✨  
From 2130 lines of HTML to 20+ focused modules!  
Faster development, easier maintenance, better code quality.
