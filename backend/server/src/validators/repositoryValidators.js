import { z } from 'zod';

export const repositoryParamsSchema = z.object({
  repoId: z.string().uuid(),
});

export const issuesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  severity: z.string().optional(),
  type: z.string().optional(),
});
