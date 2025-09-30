# Clinical Study Extraction System

[![CI/CD](https://github.com/matheus-rech/clinical-extraction-system/actions/workflows/ci.yml/badge.svg)](https://github.com/matheus-rech/clinical-extraction-system/actions)
[![Tests](https://img.shields.io/badge/tests-52%2F52%20passing-brightgreen)](https://github.com/matheus-rech/clinical-extraction-system)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Interactive PDF annotation and clinical data extraction tool with full traceability. Built with TypeScript, Vite, and PDF.js.

![Clinical Extraction System](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)

---

## ✨ Features

### 📄 PDF Integration
- **Interactive PDF Viewer** with zoom, navigation, and fit-to-width
- **Text Selection & Extraction** with precise coordinate tracking
- **Annotation Markers** showing extraction locations
- **Multi-page Support** with keyboard shortcuts

### 📝 Smart Forms
- **8-Step Multi-Section Form** for comprehensive data collection
- **Dynamic Field Generation** for flexible data entry
- **Real-time Validation** with accessibility support
- **Auto-advance** between fields for efficient workflow

### 🔍 Advanced Search
- **Markdown File Support** for reference materials
- **Full-text Search** across PDF documents
- **Search Result Highlighting** with visual markers
- **Context Preview** for quick verification

### 📊 Data Management
- **Real-time Extraction Tracking** with complete audit trail
- **Multiple Export Formats** (JSON, CSV, Audit Reports)
- **State Persistence** via localStorage
- **Coordinate Tracking** for full traceability

### ♿ Accessibility
- **WCAG 2.1 Compliant** with ARIA labels
- **Keyboard Navigation** throughout the application
- **Screen Reader Support** for all interactive elements
- **Semantic HTML** structure

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/matheus-rech/clinical-extraction-system.git
cd clinical-extraction-system

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Using with Your PDFs

1. Place PDF files in the `PDFs/` directory
2. Click "📄 Load PDF" in the application
3. Select a form field
4. Highlight text in the PDF to extract
5. Export your data when complete

---

## 🧪 Testing

**100% Test Coverage** - All tests passing!

```bash
# Run unit tests (28 tests)
npm run test
npm run test:ui      # Interactive UI

# Run E2E tests (24 tests)
npm run test:e2e
npm run test:e2e:ui  # Interactive UI

# Run all tests
npm run test:all
```

### Test Coverage
- ✅ **Unit Tests**: 28/28 passing
  - AppState management
  - Security utilities
  - Extraction tracking
- ✅ **E2E Tests**: 24/24 passing
  - PDF upload & rendering
  - Form navigation & validation
  - Data extraction workflow
  - Export functionality

---

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
# Output: dist/ directory
```

### Preview Production Build
```bash
npm run preview
```

### Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/matheus-rech/clinical-extraction-system)

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions on:
- Vercel (1-click deploy)
- Netlify
- GitHub Pages
- Custom hosting

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: TypeScript, Vite, SCSS
- **PDF**: PDF.js (bundled, not CDN)
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Backend** (optional): Convex for data persistence

### Project Structure
```
clinical-extraction-system/
├── src/
│   ├── core/              # Core utilities
│   │   ├── AppState.ts    # State management
│   │   ├── ErrorHandler.ts
│   │   └── SecurityUtils.ts
│   ├── modules/
│   │   ├── pdf/           # PDF handling
│   │   ├── form/          # Form management
│   │   ├── extraction/    # Data extraction
│   │   └── export/        # Export functionality
│   ├── styles/            # SCSS stylesheets
│   └── types/             # TypeScript definitions
├── tests/
│   ├── unit/              # Unit tests
│   └── e2e/               # E2E tests
├── convex/                # Backend (optional)
└── PDFs/                  # Sample PDFs for testing
```

### Key Modules

#### PDF Module
- `PDFLoader.ts` - Handles PDF file loading and initialization
- `PDFRenderer.ts` - Renders PDF pages with text layers
- `TextSelection.ts` - Manages text selection and extraction
- `PDFSearch.ts` - Full-text search functionality

#### Form Module
- `FormManager.ts` - Multi-step form navigation
- `FormValidator.ts` - Input validation
- `DynamicFields.ts` - Dynamic field generation

#### Extraction Module
- `ExtractionTracker.ts` - Tracks all extractions with coordinates
- Provides complete audit trail
- localStorage persistence

---

## 🔧 Configuration

### PDF.js Configuration
Located in `src/config/pdf.config.ts`:
- Worker source (bundled)
- CMap URL for character encoding
- Document options

### Security
- Content Security Policy configured
- Input sanitization
- XSS protection
- CSRF considerations

---

## 📖 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Deploy to various platforms
- [Quick Start](QUICKSTART.md) - Get started quickly
- [Production Checklist](PRODUCTION_CHECKLIST.md) - Pre-deployment checklist
- [API Documentation](convex/README.md) - Convex backend API

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write tests for new features
- Follow TypeScript best practices
- Maintain accessibility standards
- Update documentation

---

## 📊 Use Cases

### Clinical Research
- Extract study metadata from PDFs
- Track PICO-T criteria
- Collect baseline demographics
- Document interventions and outcomes

### Systematic Reviews
- Standardized data extraction
- Multiple reviewer workflow
- Complete audit trail
- Export for meta-analysis

### General PDF Data Extraction
- Form filling from PDF documents
- Data validation and cleaning
- Multi-format export
- Traceability requirements

---

## 🔒 Security

- ✅ Client-side processing (no server upload)
- ✅ Input sanitization
- ✅ Content Security Policy
- ✅ XSS protection
- ✅ Type-safe operations

For security concerns, please email: [Your security email]

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **PDF.js** - Mozilla's PDF rendering library
- **Vite** - Next generation frontend tooling
- **Playwright** - End-to-end testing
- **Convex** - Backend infrastructure

---

## 📧 Contact

- **GitHub**: [@matheus-rech](https://github.com/matheus-rech)
- **Repository**: [clinical-extraction-system](https://github.com/matheus-rech/clinical-extraction-system)
- **Issues**: [Report a bug](https://github.com/matheus-rech/clinical-extraction-system/issues)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=matheus-rech/clinical-extraction-system&type=Date)](https://star-history.com/#matheus-rech/clinical-extraction-system&Date)

---

**Made with ❤️ for clinical researchers and data scientists**