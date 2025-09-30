# Quick Start Guide

Get the form-sr application running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Convex account (free): https://convex.dev

## Setup Steps

### 1. Install Dependencies
```bash
cd form-sr
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

This will:
- Start the Convex development server
- Generate TypeScript types in `convex/_generated/`
- Open the Convex Dashboard
- Watch for file changes

### 3. Test the Application

In a new terminal, test the endpoints:

```bash
# Health check
curl http://localhost:3000/api/health

# Create a form
curl -X POST http://localhost:3000/api/forms/createForm \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "formData": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }'

# Create a job
curl -X POST http://localhost:3000/api/jobs/createJob \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "formId": "YOUR_FORM_ID_HERE"
  }'

# Check job status (HTML)
curl http://localhost:3000/api/jobs/test-123/status

# Check job status (JSON)
curl http://localhost:3000/api/jobs/test-123/status?raw=1
```

### 4. View the Dashboard

The Convex Dashboard automatically opens at:
```
https://dashboard.convex.dev
```

Here you can:
- View all tables and data
- See function logs in real-time
- Test functions directly
- Monitor performance

## Project Structure

```
form-sr/
├── convex/               # Backend logic
│   ├── forms.ts         # Form management functions
│   ├── jobs.ts          # Job processing functions
│   ├── http.ts          # HTTP endpoints
│   ├── schema.ts        # Database schema
│   └── _generated/      # Auto-generated types (git ignored)
├── README.md            # Project overview
├── DEPLOYMENT.md        # Production deployment guide
├── PRODUCTION_CHECKLIST.md  # Pre-deployment checklist
└── package.json         # Dependencies
```

## Available Functions

### Forms API
```typescript
// Create a form
await ctx.mutation(api.forms.createForm, {
  sessionId: "unique-id",
  formData: { name: "Test", email: "test@example.com" }
});

// Get form by session
await ctx.query(api.forms.getFormBySession, {
  sessionId: "unique-id"
});

// List forms by status
await ctx.query(api.forms.listFormsByStatus, {
  status: "pending",
  limit: 10
});

// Update form status
await ctx.mutation(api.forms.updateFormStatus, {
  formId: "form-id",
  status: "completed",
  result: { /* your result data */ }
});
```

### Jobs API
```typescript
// Create a job
await ctx.mutation(api.jobs.createJob, {
  sessionId: "unique-id",
  formId: "form-id"
});

// Get job status
await ctx.query(api.jobs.getJobStatus, {
  sessionId: "unique-id"
});
```

## Common Development Tasks

### Add a New Field to Forms
1. Update `convex/schema.ts`:
   ```typescript
   formData: v.object({
     name: v.optional(v.string()),
     email: v.optional(v.string()),
     phone: v.optional(v.string()), // New field
   }),
   ```

2. Update validators in `convex/forms.ts`
3. Convex automatically handles schema migrations

### Add a New Endpoint
Add to `convex/http.ts`:
```typescript
http.route({
  path: "/api/your-endpoint",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    return new Response(
      JSON.stringify({ message: "Hello" }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  }),
});
```

### View Function Logs
```bash
# Logs appear automatically in your terminal running `npm run dev`
# Or view in Convex Dashboard under "Logs" tab
```

## Troubleshooting

### Port Already in Use
```bash
# Kill the process using the port
lsof -ti:3000 | xargs kill -9

# Or change the port in Convex config
```

### TypeScript Errors
```bash
# Regenerate types
rm -rf convex/_generated
npm run dev
```

### "Module not found" Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Functions Not Appearing
```bash
# Make sure you're exporting functions correctly
export const myFunction = query({ ... })  # ✅ Correct
const myFunction = query({ ... })         # ❌ Wrong (not exported)
```

## Next Steps

1. ✅ Read the [README.md](./README.md) for project overview
2. ✅ Check out [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
3. ✅ Review [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) before going live
4. 🔧 Implement your custom job processing logic in `convex/jobs.ts`
5. 🔧 Add authentication (Clerk recommended)
6. 🔧 Create your frontend UI

## Useful Links

- **Convex Docs**: https://docs.convex.dev
- **Convex Dashboard**: https://dashboard.convex.dev
- **Convex Community**: https://convex.dev/community
- **Convex Examples**: https://github.com/get-convex/convex-demos

## Getting Help

### Documentation
- Project README: [README.md](./README.md)
- Deployment Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Developer Guide: [CLAUDE.md](./CLAUDE.md)

### Support
- Convex Discord: https://convex.dev/community
- Convex Support: support@convex.dev
- Convex Docs: https://docs.convex.dev

## Development Workflow

```bash
# 1. Start development server
npm run dev

# 2. Make changes to files in convex/

# 3. Convex automatically:
#    - Validates your schema
#    - Regenerates types
#    - Deploys to dev environment
#    - Shows logs in terminal

# 4. Test your changes
curl http://localhost:3000/api/health

# 5. Deploy to production when ready
npm run build
```

## Production Deployment

When you're ready to deploy:

```bash
# 1. Review the checklist
cat PRODUCTION_CHECKLIST.md

# 2. Run deployment
npx convex deploy

# 3. Test production endpoints
curl https://your-project.convex.cloud/api/health
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guide.

---

**Need help?** Check the documentation links above or reach out to the Convex community!
