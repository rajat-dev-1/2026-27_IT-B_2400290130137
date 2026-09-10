import { z } from 'zod';

export const scanParamsSchema = z.object({
  repoId: z.string().uuid().optional(),
  scanId: z.string().uuid().optional(),
});

export const scanBodySchema = z.object({
  trigger: z.enum(['manual']).optional(),
  force: z.boolean().optional(),
}).strict().default({});
