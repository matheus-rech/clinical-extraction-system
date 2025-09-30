# Supabase Integration Guide

This guide explains how Supabase replaces the legacy Google Sheets workflow while
preserving the data shapes that downstream tooling expects. The solution favors a
locally bundled Supabase client (`@supabase/supabase-js`) to avoid CDN loading issues
and aligns with the debugging-first, production-ready requirements of the project.

## Architecture Overview

- **Form submissions table (`form_submissions`)** – Stores the original key/value
  payload as JSON so it mirrors the Google Sheets column structure. Additional
  scalar columns (document name, totals) make filtering efficient without
  denormalizing the JSON blob.
- **Extraction coordinates table (`extraction_coordinates`)** – Persists each
  bounding box with page context. This keeps coordinate traceability separated
  from form payloads, which simplifies analytics and re-rendering.
- **Supabase service layer** – The front end uses a singleton Supabase client and
  a `SupabaseService` abstraction so that future migrations (e.g., moving to a
  server-side proxy) require no component changes.

This separation keeps write operations transactional—form data is inserted once,
then all coordinate rows are inserted in a batch, ensuring referential integrity
without the need for database transactions unavailable to anon clients.

## Schema Design Decisions

| Table | Purpose | Key Columns | Rationale |
|-------|---------|-------------|-----------|
| `form_submissions` | Stores one row per extraction session | `document_name`, `form_payload`, `total_pages`, `extraction_count`, `metadata` | JSON payload keeps field compatibility with the Google Sheet; scalar columns support dashboard queries without JSON parsing. |
| `extraction_coordinates` | Stores one row per extracted text selection | `submission_id`, `field_name`, `page`, `x`, `y`, `width`, `height`, `selection_method` | Decoupling coordinates from form data avoids bloating the JSON payload and enables replaying bounding boxes for auditing. |

Both tables use UUID primary keys (generated automatically by Supabase) to keep
URL-safe identifiers for downstream systems.

## Row Level Security (RLS)

RLS is enabled on both tables to block reads from anonymous users while allowing
client-side inserts. The migration script adds:

- **Insert policy** for the `anon` role so the front end can write form data
  without exposing historical rows.
- **Select/update/delete policies** restricted to `authenticated` users so that
  team members can review submissions via Supabase Studio or admin tools.
- Policies for the `service_role` to support server-side maintenance jobs.

Because anonymous inserts are allowed, validation happens in the application
layer before writing. Should abuse become a concern, you can tighten policies
and route writes through a Vercel serverless function using the service role key
without altering the UI layer.

## Migration Script

Run the SQL migration in `supabase/migrations/20250218_init_form_tables.sql` to
provision the tables, indexes, and policies:

```bash
supabase db push --file supabase/migrations/20250218_init_form_tables.sql
```

The script is idempotent—`CREATE TABLE IF NOT EXISTS` guards let you re-run it in
new environments without dropping data. Indexes on `document_name`,
`submission_id`, and `created_at` keep PDF lookups and audit queries fast.

## Vercel Deployment Configuration

Set these environment variables in Vercel (Project Settings → Environment
Variables) for both Preview and Production:

- `VITE_SUPABASE_URL` – The Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` – The anon key for client-side inserts.
- *(Optional)* `VITE_SUPABASE_SCHEMA` – Defaults to `public`; override only if
  you use a custom schema.

Because the client disables session persistence, no browser storage is touched,
keeping the integration stateless for Vercel’s static deployments. If you later
move persistence server-side, only the `SupabaseClient` needs to change.

## Migrating Existing Google Sheets Data

1. Export the Google Sheet as CSV.
2. Split the export into two CSV files:
   - **Form submissions** – One row per study, keeping all existing columns plus
     `document_name` and `total_pages` if available.
   - **Extraction coordinates** – Flatten repeated columns into long-form rows
     with `submission_external_id`, `field_name`, `page`, `x`, `y`, `width`,
     `height`, and `selection_method`.
3. Import the form CSV into `form_submissions` using Supabase Studio, mapping the
   original columns into the `form_payload` JSON column.
4. Import the coordinate CSV into `extraction_coordinates`, mapping
   `submission_external_id` to the `id` produced in step 3.

For future-proofing, the application stores the original key names so exports to
CSV/JSON retain backward compatibility.

## Bounding Box Logic and Coordinate Format

Bounding boxes are calculated client-side by enveloping every selected text item
inside the PDF text layer. The logic is implemented in
`TextSelection.calculateBoundingBox`, which finds the minimum/maximum X/Y values
and derives width/height in PDF pixels.【F:src/modules/pdf/TextSelection.ts†L66-L94】

When a selection is stored, the application immediately renders a visual marker
using those coordinates so the operator can confirm the region. The renderer
simply positions an absolutely positioned `<div>` using the stored `x`, `y`,
`width`, and `height` values.【F:src/modules/pdf/TextSelection.ts†L96-L116】 This is
exactly what the UI would do when reloading persisted coordinates from Supabase.

Example coordinate payload saved to Supabase:

```json
{
  "submission_id": "submission-123",
  "field_name": "primary_outcome",
  "page": 4,
  "x": 112,
  "y": 348,
  "width": 216,
  "height": 54,
  "selection_method": "manual"
}
```

To recreate the bounding box later, fetch the rows for a submission and append a
div per row using the same CSS class as `addExtractionMarker`. The service method
`SupabaseService.fetchSubmissionWithCoordinates` wraps that lookup so the caller
can hydrate markers with minimal boilerplate.【F:src/modules/data/SupabaseService.ts†L79-L109】

## API Changes

- Form submission now calls `DataSyncService.persistCurrentSession`, which writes
  to Supabase and records the returned submission ID in application state. The UI
  shows a contextual status message if Supabase is misconfigured or fails.【F:src/modules/form/FormManager.ts†L1-L32】【F:src/modules/form/FormManager.ts†L188-L220】
- A singleton Supabase client enforces a single connection and makes it easy to
  swap in an alternative backend (e.g., server-side proxy).【F:src/modules/data/SupabaseClient.ts†L1-L38】
- Tests cover the transformation logic so regressions in payload shape are caught
  automatically.【F:tests/unit/SupabaseService.test.ts†L1-L132】

These changes maintain the original data semantics while removing the brittle
Google Sheets integration.
