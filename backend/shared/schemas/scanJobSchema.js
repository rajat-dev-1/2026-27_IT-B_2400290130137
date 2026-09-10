import { z } from 'zod';

export const scanJobSchema = z.object({
  scanId: z.string().uuid(),
  repoId: z.string().uuid(),
  userId: z.string().uuid(),
  commitSHA: z.string().min(1).max(100),
  trigger: z.literal('manual'),
});
