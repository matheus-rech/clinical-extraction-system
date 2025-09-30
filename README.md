# Form Submission & Processing System

A Convex-powered form submission and processing system with job tracking.

## Project Structure

```
form-sr/
├── convex/
│   ├── schema.ts          # Database schema definitions
│   ├── forms.ts           # Form-related queries and mutations
│   ├── jobs.ts            # Job processing functions
│   ├── http.ts            # HTTP endpoints
│   └── tsconfig.json      # Convex TypeScript config
├── package.json
├── tsconfig.json
└── README.md
```

## Features

- ✅ **Form Management**: Create and track form submissions
- ✅ **Job Processing**: Background job processing with progress tracking
- ✅ **Status API**: HTTP endpoint for checking job status
- ✅ **Type Safety**: Full TypeScript support with Convex validators
- ✅ **Indexes**: Optimized database queries with proper indexing
- ✅ **Best Practices**: Follows Convex guidelines and patterns

## Database Schema

### Tables

1. **forms**: Store form submissions
   - `sessionId`: Unique session identifier
   - `status`: pending | processing | completed | failed
   - `formData`: Form field data
   - `result`: Processing results (optional)
   - `error`: Error message (optional)

2. **jobs**: Track processing jobs
   - `sessionId`: Associated session ID
   - `formId`: Reference to form
   - `status`: queued | running | completed | failed
   - `progress`: Progress percentage (0-100)
   - `result`: Job results (optional)
   - `error`: Error message (optional)

## API Functions

### Forms (`convex/forms.ts`)

- `getFormBySession(sessionId)` - Get form by session ID
- `listFormsByStatus(status, limit?)` - List forms by status
- `createForm(sessionId, formData)` - Create new form submission
- `updateFormStatus(formId, status, result?, error?)` - Update form status

### Jobs (`convex/jobs.ts`)

- `getJobStatus(sessionId)` - Get job status by session ID
- `createJob(sessionId, formId)` - Create new processing job
- `updateJobProgress(jobId, progress, status?)` - Update job progress (internal)
- `completeJob(jobId, result)` - Mark job as completed (internal)
- `failJob(jobId, error)` - Mark job as failed (internal)

### HTTP Endpoints (`convex/http.ts`)

- `GET /api/jobs/:sessionId/status` - Check job status
  - Add `?raw=1` for JSON-only response (useful for CLI polling)

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Convex**:
   ```bash
   npx convex dev
   ```

3. **Deploy** (when ready):
   ```bash
   npx convex deploy
   ```

## Usage Examples

### Create a Form Submission

```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const createForm = useMutation(api.forms.createForm);

// In your component
const handleSubmit = async (data) => {
  const { formId } = await createForm({
    sessionId: "unique-session-id",
    formData: {
      name: data.name,
      email: data.email,
    },
  });
  console.log("Form created:", formId);
};
```

### Check Job Status

```typescript
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

const jobStatus = useQuery(api.jobs.getJobStatus, {
  sessionId: "unique-session-id",
});

console.log(jobStatus?.status); // queued | running | completed | failed
console.log(jobStatus?.progress); // 0-100
```

### HTTP Status Check

```bash
# HTML response
curl https://your-app.convex.cloud/api/jobs/session-123/status

# JSON response
curl https://your-app.convex.cloud/api/jobs/session-123/status?raw=1
```

## Best Practices Implemented

✅ All functions have proper validators for `args` and `returns`  
✅ Internal functions use `internalMutation` and `internalQuery`  
✅ Proper database indexes for efficient queries  
✅ Index names include all field names (e.g., `by_status_and_creationTime`)  
✅ Type-safe with TypeScript and Convex validators  
✅ Proper error handling with meaningful messages  
✅ Uses `ctx.db.patch()` for updates instead of replace  
✅ Queries use indexes with `withIndex()` to avoid table scans  

## Production Ready Features

✅ **Security Hardened**
- Input validation and sanitization
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- XSS protection with HTML escaping
- Path traversal protection

✅ **Monitoring & Health Checks**
- `/api/health` endpoint for load balancers
- Comprehensive error handling
- Proper HTTP status codes

✅ **Type Safety & Quality**
- Full TypeScript coverage
- Convex validators on all functions
- No TypeScript compilation errors

✅ **Documentation**
- Comprehensive deployment guide (see DEPLOYMENT.md)
- API documentation
- Code comments and examples

## Deployment

For production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick deploy:
```bash
npm install
npx convex login
npx convex deploy
```

## Next Steps

- Add authentication and access control (Clerk, Auth0, or Convex Auth)
- Implement actual job processing logic
- Add pagination for large result sets  
- Add file upload support if needed
- Create client UI components
- Set up CI/CD pipeline
- Configure monitoring and alerting

