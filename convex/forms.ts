import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

/**
 * Public query to get a form by session ID.
 */
export const getFormBySession = query({
  args: {
    sessionId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("forms"),
      _creationTime: v.number(),
      sessionId: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed")
      ),
      formData: v.object({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
      }),
      result: v.optional(v.any()),
      error: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const form = await ctx.db
      .query("forms")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .unique();
    
    return form;
  },
});

/**
 * Public query to list forms by status with pagination.
 */
export const listFormsByStatus = query({
  args: {
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("forms"),
      _creationTime: v.number(),
      sessionId: v.string(),
      status: v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed")
      ),
      formData: v.object({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
      }),
      result: v.optional(v.any()),
      error: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    // Query forms by status, ordered by creation time (descending)
    // Note: _creationTime is automatically added to all indexes
    const forms = await ctx.db
      .query("forms")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .take(limit);
    
    return forms;
  },
});

/**
 * Public mutation to create a new form submission.
 */
export const createForm = mutation({
  args: {
    sessionId: v.string(),
    formData: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
    }),
  },
  returns: v.object({
    formId: v.id("forms"),
  }),
  handler: async (ctx, args) => {
    const formId = await ctx.db.insert("forms", {
      sessionId: args.sessionId,
      status: "pending",
      formData: args.formData,
    });
    
    return { formId };
  },
});

/**
 * Public mutation to update form status.
 */
export const updateFormStatus = mutation({
  args: {
    formId: v.id("forms"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    result: v.optional(v.any()),
    error: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { formId, status, result, error } = args;
    
    const form = await ctx.db.get(formId);
    if (!form) {
      throw new Error(`Form with ID ${formId} not found`);
    }
    
    await ctx.db.patch(formId, {
      status,
      ...(result !== undefined && { result }),
      ...(error !== undefined && { error }),
    });
    
    return null;
  },
});

