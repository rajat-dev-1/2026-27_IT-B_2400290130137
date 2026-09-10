import { z } from 'zod';

export const authCallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  // state is optional here: when GitHub sends an error redirect it may omit state.
  // The controller validates state presence/match and redirects to the frontend error page.
  state: z.string().min(1).optional(),
  error: z.string().optional(),
  iss: z.string().url().refine((val) => val === 'https://github.com/login/oauth', {
    message: 'Invalid issuer',
  }).optional(),
}).refine(data => data.code || data.error, {
  message: 'Either code or error is required',
  path: ['code']
});
