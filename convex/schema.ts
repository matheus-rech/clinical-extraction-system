import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Database schema definition following Convex best practices.
 * 
 * Tables:
 * - forms: Store form submissions with metadata
 * - jobs: Track processing jobs for form submissions
 */
export default defineSchema({
  // Form submissions table
  forms: defineTable({
    // Form metadata
    sessionId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    
    // Form data
    formData: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      // Add more fields as needed
    }),
    
    // Processing results
    result: v.optional(v.any()),
    error: v.optional(v.string()),
    
    // Timestamps are automatic via _creationTime system field
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_status", ["status"]),
    // Note: _creationTime is automatically added to all indexes by Convex

  // Processing jobs table
  jobs: defineTable({
    sessionId: v.string(),
    formId: v.id("forms"),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    progress: v.optional(v.number()),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_formId", ["formId"])
    .index("by_status", ["status"]),
});

