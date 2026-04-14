import { z } from "zod";

export const proposalAnalysisSchema = z.object({
  overview: z.object({
    documentType: z.string(),
    submissionDeadline: z.string().nullable(),
    estimatedComplexity: z.enum(["low", "medium", "high"]),
    summary: z.string(),
  }),
  requirements: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      status: z.enum(["covered", "partially_covered", "missing"]),
      needsSME: z.boolean(),
      sourceRefs: z.array(z.string()),
    }),
  ),
  risks: z.array(
    z.object({
      title: z.string(),
      severity: z.enum(["high", "medium", "low"]),
      description: z.string(),
      recommendation: z.string(),
      sourceRefs: z.array(z.string()).default([]),
    }),
  ),
  draft: z.object({
    executiveSummary: z.string(),
    responseStrategy: z.string(),
    keyDifferentiators: z.array(z.string()),
    openQuestions: z.array(z.string()),
    sourceRefs: z.array(z.string()).default([]),
  }),
  sources: z.array(
    z.object({
      id: z.string(),
    }),
  ).default([]),
});

export type ProposalAnalysisModelOutput = z.infer<typeof proposalAnalysisSchema>;
