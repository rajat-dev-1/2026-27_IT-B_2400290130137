import { z } from 'zod';

const authCallbackQuerySchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1),
  error: z.string().optional(),
  iss: z.string().url().refine((val) => val === 'https://github.com/login/oauth', {
    message: 'Invalid issuer',
  }).optional(),
}).refine(data => data.code || data.error, {
  message: 'Either code or error is required',
  path: ['code']
});

try {
  authCallbackQuerySchema.parse({ code: 'mock_code', state: 'mock_state' });
  console.log('Test 1 passed');
} catch (e) {
  console.error('Test 1 failed', e.errors);
}

try {
  authCallbackQuerySchema.parse({ code: 'mock_code', state: 'mock_state', iss: 'https://github.com/login/oauth' });
  console.log('Test 2 passed');
} catch (e) {
  console.error('Test 2 failed', e.errors);
}

try {
  authCallbackQuerySchema.parse({ code: 'mock_code', state: 'mock_state', maliciousParam: 'attack' });
  console.log('Test 3 passed');
} catch (e) {
  console.error('Test 3 failed', e.errors);
}
