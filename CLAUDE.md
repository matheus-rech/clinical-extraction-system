# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Convex-powered form submission and processing system with job tracking capabilities. The system handles form submissions with background job processing, progress tracking, and status APIs.

## Architecture

### Tech Stack
- **Backend**: Convex (serverless backend platform)
- **Language**: TypeScript
- **Database**: Convex database with automatic indexing

### Core Components

**Database Schema** (`convex/schema.ts`)
- `forms`: Stores form submissions with fields for sessionId, status (pending/processing/completed/failed), formData, result, and error
- `jobs`: Tracks processing jobs linked to forms with status tracking (queued/running/completed/failed) and progress (0-100)

**Function Modules**
- `convex/forms.ts`: Form management queries and mutations
- `convex/jobs.ts`: Job processing functions with internal mutations for progress updates
- `convex/http.ts`: HTTP endpoints for external API access

### Key Patterns

**Function Declaration**: Uses new Convex function syntax with explicit validators
```typescript
export const functionName = query/mutation({
  args: { /* validators */ },
  returns: v.type(),
  handler: async (ctx, args) => { /* implementation */ }
})
```

**Internal Functions**: Use `internalMutation` for system-only operations (updateJobProgress, completeJob, failJob)

**Database Operations**
- Always use indexes with `withIndex()` for queries
- Use `ctx.db.patch()` for partial updates instead of replace
- Index naming convention: `by_field` or `by_field1_and_field2`

## Commands

```bash
# Development
npm run dev         # Start Convex dev server (or: npx convex dev)

# Production
npm run build       # Deploy to Convex (or: npx convex deploy)

# Installation
npm install         # Install dependencies
```

## API Endpoints

### HTTP API
- `GET /api/jobs/:sessionId/status` - Check job status (HTML response)
- `GET /api/jobs/:sessionId/status?raw=1` - Check job status (JSON response)

### Convex Functions

**Forms API**
- `getFormBySession(sessionId)` - Query form by session
- `listFormsByStatus(status, limit?)` - List forms with pagination
- `createForm(sessionId, formData)` - Create new submission
- `updateFormStatus(formId, status, result?, error?)` - Update form

**Jobs API**
- `getJobStatus(sessionId)` - Query job status
- `createJob(sessionId, formId)` - Create processing job
- Internal: `updateJobProgress`, `completeJob`, `failJob`

## Development Guidelines

### Convex Best Practices
- All functions must have explicit `args` and `returns` validators
- Use `v.null()` validator for null returns, not undefined
- Functions returning nothing should explicitly return null
- Use proper Convex types (e.g., `v.id("tableName")` for document IDs)
- Keep array sizes under 8192 values and objects under 1024 entries

### Error Handling
- Check if documents exist before patching: `if (!doc) throw new Error(...)`
- Return meaningful error messages in catch blocks
- Use proper HTTP status codes in endpoints (400, 500, etc.)

### Type Safety
- Import types from `./_generated/dataModel` for `Doc` and `Id`
- Use union validators for status enums
- Optional fields use `v.optional(v.type())`