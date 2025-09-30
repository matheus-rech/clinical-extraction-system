import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Public query to get job status by session ID.
 */
export const getJobStatus = query({
  args: {
    sessionId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("jobs"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("jobs")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .first();
    
    return job;
  },
});

/**
 * Public mutation to create a new processing job.
 */
export const createJob = mutation({
  args: {
    sessionId: v.string(),
    formId: v.id("forms"),
  },
  returns: v.object({
    jobId: v.id("jobs"),
  }),
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("jobs", {
      sessionId: args.sessionId,
      formId: args.formId,
      status: "queued",
    });
    
    return { jobId };
  },
});

/**
 * Internal mutation to update job progress.
 */
export const updateJobProgress = internalMutation({
  args: {
    jobId: v.id("jobs"),
    progress: v.number(),
    status: v.optional(
      v.union(
        v.literal("queued"),
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { jobId, progress, status } = args;
    
    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    await ctx.db.patch(jobId, {
      progress,
      ...(status && { status }),
    });
    
    return null;
  },
});

/**
 * Internal mutation to complete a job.
 */
export const completeJob = internalMutation({
  args: {
    jobId: v.id("jobs"),
    result: v.any(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { jobId, result } = args;
    
    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    await ctx.db.patch(jobId, {
      status: "completed",
      progress: 100,
      result,
    });
    
    return null;
  },
});

/**
 * Internal mutation to fail a job.
 */
export const failJob = internalMutation({
  args: {
    jobId: v.id("jobs"),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { jobId, error } = args;
    
    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    
    await ctx.db.patch(jobId, {
      status: "failed",
      error,
    });
    
    return null;
  },
});

