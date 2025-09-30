# Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Deploy to Vercel (Recommended - 1 Click!)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/matheus-rech/clinical-extraction-system)

**OR using Vercel CLI:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option 2: Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/matheus-rech/clinical-extraction-system)

**OR using Netlify CLI:**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### Option 3: Deploy to GitHub Pages

```bash
npm run build
npx gh-pages -d dist
```

Then enable GitHub Pages in your repository settings:
1. Go to Settings > Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` / `root`

---

## 📋 Pre-Deployment Checklist

- [x] All tests passing (52/52)
- [x] Production build successful
- [x] Environment variables configured
- [x] Security headers in place
- [x] PDF.js bundled (not CDN)
- [x] CSP headers configured

---

## 🔧 Environment Setup

### Required Environment Variables

**None required!** This app runs entirely client-side.

### Optional Environment Variables (for Convex backend)

If you want to use the Convex backend features:

```env
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

To set up Convex:
```bash
npm install -g convex
convex dev
convex deploy
```

---

## 🌐 Platform-Specific Configuration

### Vercel Configuration (`vercel.json`)
✅ Already configured!
- SPA routing
- Security headers
- Asset caching
- Build settings

### Netlify Configuration
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
```

### GitHub Pages Configuration
Add to `package.json`:
```json
{
  "scripts": {
    "deploy:pages": "npm run build && gh-pages -d dist"
  }
}
```

---

## 🤖 CI/CD with GitHub Actions

✅ Already configured! (`.github/workflows/ci.yml`)

The workflow automatically:
- ✅ Runs all tests on every push
- ✅ Builds the application
- ✅ Deploys to Vercel (when secrets are configured)

### Setting up Vercel Secrets

1. Get your Vercel tokens:
```bash
vercel login
vercel link  # Link to your project
```

2. Add these secrets to GitHub:
   - Go to Settings > Secrets and variables > Actions
   - Add these secrets:
     - `VERCEL_TOKEN` - Get from vercel.com/account/tokens
     - `VERCEL_ORG_ID` - Found in `.vercel/project.json`
     - `VERCEL_PROJECT_ID` - Found in `.vercel/project.json`

---

## 📦 Build Configuration

### Production Build
```bash
npm run build
```

Output: `dist/` directory with optimized assets

### Build Optimization
- ✅ Code splitting enabled
- ✅ Tree shaking enabled
- ✅ Asset minification
- ✅ Source maps for debugging

### Build Size
Expected output:
- HTML: ~15 KB
- CSS: ~30 KB
- JS: ~400 KB (includes PDF.js library)
- Total: ~445 KB gzipped

---

## 🔒 Security Considerations

### Content Security Policy
Configured in `index.html`:
- Self-hosted assets
- CDN access for cmaps only
- Inline scripts allowed (required for PDF.js)

### Security Headers
Configured in `vercel.json`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: enabled

---

## 🧪 Testing Production Build Locally

```bash
# Build the application
npm run build

# Preview the production build
npm run preview

# Open in browser
open http://localhost:4173
```

---

## 📊 Monitoring & Analytics

### Recommended Services
- **Vercel Analytics** - Built-in (free tier available)
- **Google Analytics** - Add to `index.html`
- **Sentry** - Error tracking (optional)

### Adding Analytics
```html
<!-- Add to index.html <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## 🐛 Troubleshooting

### Build Fails
1. Clear `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Check Node version (requires Node 18+):
   ```bash
   node --version
   ```

### PDF.js Not Loading
- ✅ Already fixed! Using bundled version, not CDN
- If issues persist, clear browser cache

### Tests Failing in CI
- Ensure Playwright browsers are installed
- Check test timeout settings
- Review CI logs for specific errors

---

## 🎯 Post-Deployment

### 1. Verify Deployment
- [ ] Open deployed URL
- [ ] Test PDF upload
- [ ] Test form navigation
- [ ] Test export functions
- [ ] Check console for errors

### 2. Update Repository
Add deployment URL to README:
```markdown
## 🌐 Live Demo
https://your-app.vercel.app
```

### 3. Monitor Performance
- Check Lighthouse scores
- Monitor Core Web Vitals
- Review error logs

---

## 📞 Need Help?

- 📖 [Vercel Documentation](https://vercel.com/docs)
- 📖 [Netlify Documentation](https://docs.netlify.com)
- 📖 [GitHub Pages Guide](https://pages.github.com)
- 🐛 [Report Issues](https://github.com/matheus-rech/clinical-extraction-system/issues)

---

**Your app is ready to deploy!** Choose any platform above and go live in minutes! 🚀
