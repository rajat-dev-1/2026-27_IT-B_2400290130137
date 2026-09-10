import { z } from 'zod';

export const liveResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    status: z.literal('ok'),
    service: z.string()
  })
});

export const readyResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    status: z.literal('ok'),
    database: z.string(),
    redis: z.string()
  })
});
