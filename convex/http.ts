import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

/**
 * Health check endpoint for monitoring and load balancers.
 * Path: /api/health
 */
http.route({
  path: "/api/health",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    return new Response(
      JSON.stringify({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        service: "form-sr"
      }),
      {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
      }
    );
  }),
});

/**
 * HTTP endpoint to check job status with optional raw JSON response.
 * Path: /api/jobs/:sessionId/status
 * Query param: raw=1 for JSON-only response (useful for CLI polling)
 */
http.route({
  path: "/api/jobs/:sessionId/status",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    const url = new URL(req.url);
    const sessionId = url.pathname.split("/")[3]; // Extract sessionId from path
    const isRawRequest = url.searchParams.get("raw") === "1";
    
    // Validate sessionId
    if (!sessionId || sessionId.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff"
          },
        }
      );
    }
    
    // Basic input sanitization - prevent path traversal
    if (sessionId.includes("..") || sessionId.includes("/")) {
      return new Response(
        JSON.stringify({ error: "Invalid session ID format" }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "X-Content-Type-Options": "nosniff"
          },
        }
      );
    }
    
    try {
      const jobStatus = await ctx.runQuery(api.jobs.getJobStatus, {
        sessionId,
      });
      
      const responseData = {
        sessionId,
        job: jobStatus,
        timestamp: Date.now(),
      };
      
      // Return JSON-only response if raw=1 parameter is present
      if (isRawRequest) {
        return new Response(JSON.stringify(responseData), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
          },
        });
      }
      
      // Otherwise return HTML response with embedded JSON
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Job Status - ${sessionId}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    pre {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.875rem;
    }
    .status.queued { background: #fef3c7; color: #92400e; }
    .status.running { background: #dbeafe; color: #1e40af; }
    .status.completed { background: #d1fae5; color: #065f46; }
    .status.failed { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <h1>Job Status</h1>
  <p><strong>Session ID:</strong> ${sessionId}</p>
  ${jobStatus ? `
    <p><strong>Status:</strong> <span class="status ${jobStatus.status}">${jobStatus.status}</span></p>
    ${jobStatus.progress !== undefined ? `<p><strong>Progress:</strong> ${jobStatus.progress}%</p>` : ""}
    ${jobStatus.error ? `<p><strong>Error:</strong> ${jobStatus.error}</p>` : ""}
  ` : "<p>No job found for this session.</p>"}
  <h2>JSON Response</h2>
  <pre>${JSON.stringify(responseData, null, 2)}</pre>
  <p><small>Tip: Add <code>?raw=1</code> to the URL for JSON-only response.</small></p>
</body>
</html>`;
      
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (isRawRequest) {
        return new Response(
          JSON.stringify({ error: errorMessage }),
          {
            status: 500,
            headers: { 
              "Content-Type": "application/json",
              "X-Content-Type-Options": "nosniff"
            },
          }
        );
      }
      
      // Escape HTML to prevent XSS
      const escapedError = errorMessage
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      
      return new Response(
        `<html><body><h1>Error</h1><p>${escapedError}</p></body></html>`,
        {
          status: 500,
          headers: { 
            "Content-Type": "text/html; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY"
          },
        }
      );
    }
  }),
});

// Export the HTTP router
export default http;

