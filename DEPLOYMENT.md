# Production Deployment Guide

This guide covers deploying the form-sr application to production using Convex.

## Prerequisites

- Node.js 18+ installed
- Convex account (sign up at https://convex.dev)
- npm or yarn package manager

## Pre-Deployment Checklist

### 1. Code Quality
- ✅ All TypeScript types are properly defined
- ✅ No TypeScript compiler errors
- ✅ All functions have proper validators
- ✅ Security headers are configured
- ✅ Input validation is in place

### 2. Environment Configuration
Create a `.env` file with the following variables:
```bash
# Production Convex Deployment URL
CONVEX_DEPLOYMENT=https://your-project.convex.cloud

# For CI/CD deployments
CONVEX_DEPLOY_KEY=your-deploy-key-here

# Application settings
NODE_ENV=production
```

### 3. Security Review
- ✅ HTTP endpoints have input validation
- ✅ Security headers are configured (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ XSS protection with HTML escaping
- ✅ Path traversal protection
- ✅ CORS is handled by Convex platform

## Deployment Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Login to Convex
```bash
npx convex login
```

### Step 3: Initialize Project (First Time Only)
```bash
npx convex dev
# This will create a new project and link it
# Follow the prompts to create a new project or select an existing one
```

### Step 4: Test Locally
```bash
# Start development server
npm run dev

# In another terminal, test the endpoints
curl http://localhost:3000/api/health
```

### Step 5: Deploy to Production
```bash
npm run build
# This runs: npx convex deploy
```

### Step 6: Verify Deployment
After deployment, Convex will provide you with a production URL. Test the endpoints:

```bash
# Health check
curl https://your-project.convex.cloud/api/health

# Status check (replace with actual sessionId)
curl https://your-project.convex.cloud/api/jobs/test-123/status?raw=1
```

## Production Monitoring

### Health Check Endpoint
Monitor application health using:
```
GET /api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-30T12:00:00.000Z",
  "service": "form-sr"
}
```

### Logging and Monitoring
- Convex Dashboard: https://dashboard.convex.dev
- View function logs in real-time
- Monitor query/mutation performance
- Track database size and operations

### Rate Limiting
Convex provides built-in rate limiting:
- Free tier: 1M function calls/month
- Paid tiers: Scale as needed
- See: https://www.convex.dev/pricing

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Convex

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Deploy to Convex
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
        run: npx convex deploy --cmd-url-env-var-name CONVEX_DEPLOYMENT
```

### Environment Variables for CI/CD
Set these secrets in your CI/CD platform:
- `CONVEX_DEPLOY_KEY`: Get from https://dashboard.convex.dev/settings/deploy-keys

## Database Migration Strategy

### Schema Changes
1. Make schema changes in `convex/schema.ts`
2. Deploy to a development environment first:
   ```bash
   npx convex dev
   ```
3. Test thoroughly
4. Deploy to production:
   ```bash
   npx convex deploy --prod
   ```

### Data Migrations
For complex migrations:
1. Create a migration function in `convex/migrations.ts`
2. Mark as internal mutation
3. Run via Convex dashboard or CLI
4. Verify data integrity

## Performance Optimization

### Database Indexes
All critical queries use indexes:
- `forms.by_sessionId`
- `forms.by_status`
- `forms.by_status_and_creationTime`
- `jobs.by_sessionId`
- `jobs.by_formId`
- `jobs.by_status`

### Caching Strategy
- HTTP responses have appropriate cache headers
- Use Convex's built-in caching for queries
- Consider CDN for static assets

## Backup and Recovery

Convex provides automatic backups:
- Point-in-time recovery available
- Snapshots retained per your plan
- Export data via Dashboard or API

### Manual Backup
```bash
# Export all data
npx convex export --output backup.jsonl
```

### Restore from Backup
```bash
# Import data
npx convex import --input backup.jsonl
```

## Scaling Considerations

### Function Performance
- Queries: < 100ms typical
- Mutations: < 100ms typical  
- HTTP Actions: < 1s typical

### Database Limits
- Document size: 1MB max
- Array size: 8192 elements max
- Object entries: 1024 max

### Monitoring Metrics
Track these via Convex Dashboard:
- Function execution time
- Error rates
- Database query patterns
- Storage usage

## Security Best Practices

### ✅ Implemented
1. Input validation on all public endpoints
2. Security headers (X-Frame-Options, CSP, etc.)
3. HTML escaping to prevent XSS
4. Path traversal protection
5. Separate internal/public functions

### 🔧 Recommended Additions
1. **Authentication**: Add user authentication
   ```bash
   npm install @clerk/clerk-js
   # Or use Convex Auth
   ```

2. **Rate Limiting**: Implement application-level rate limiting for specific endpoints

3. **Audit Logging**: Log all mutations for compliance
   ```typescript
   // Add to mutations
   await ctx.db.insert("audit_log", {
     action: "createForm",
     userId: ctx.auth.getUserIdentity()?.tokenIdentifier,
     timestamp: Date.now()
   });
   ```

4. **Data Encryption**: Encrypt sensitive fields at application level

## Rollback Procedure

If issues arise after deployment:

1. **Immediate Rollback**
   ```bash
   npx convex deploy --previous-version
   ```

2. **Function-Level Rollback**
   - Use Convex Dashboard to disable specific functions
   - Redeploy previous code version

3. **Data Rollback**
   - Use point-in-time recovery from Dashboard
   - Or restore from manual backup

## Support and Troubleshooting

### Common Issues

**Issue**: TypeScript errors during deployment
```bash
# Solution: Clear cache and rebuild
rm -rf .convex node_modules
npm install
npx convex deploy
```

**Issue**: Functions not appearing in Dashboard
```bash
# Solution: Push schema first
npx convex deploy --push-schema-only
npx convex deploy
```

**Issue**: Rate limit errors
```bash
# Solution: Upgrade plan or optimize queries
# Use indexes, reduce query frequency, add caching
```

### Getting Help
- Documentation: https://docs.convex.dev
- Discord Community: https://convex.dev/community
- Support: support@convex.dev

## Post-Deployment Verification

### 1. Smoke Tests
```bash
# Health check
curl https://your-project.convex.cloud/api/health

# Create test form
curl -X POST https://your-project.convex.cloud/createForm \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test-123","formData":{"name":"Test"}}'
```

### 2. Monitor Dashboard
- Check function logs for errors
- Verify query performance
- Monitor storage usage

### 3. Set Up Alerts
Configure alerts in Convex Dashboard for:
- High error rates
- Slow queries (>500ms)
- Storage limits (>80% capacity)

## Maintenance Schedule

### Weekly
- Review error logs
- Check performance metrics
- Verify backup status

### Monthly  
- Review and optimize indexes
- Analyze query patterns
- Update dependencies
- Security audit

### Quarterly
- Capacity planning review
- Performance optimization
- Documentation updates

## Production Checklist

Before going live, verify:

- [ ] All environment variables are set
- [ ] Production Convex project is created
- [ ] Deploy keys are configured in CI/CD
- [ ] Health check endpoint returns 200
- [ ] All critical paths are tested
- [ ] Monitoring/alerting is configured
- [ ] Backup strategy is documented
- [ ] Rollback procedure is tested
- [ ] Team has access to Convex Dashboard
- [ ] Documentation is up to date

## Additional Resources

- [Convex Production Best Practices](https://docs.convex.dev/production/best-practices)
- [Convex Security Guide](https://docs.convex.dev/production/security)
- [Convex Performance Guide](https://docs.convex.dev/production/performance)
