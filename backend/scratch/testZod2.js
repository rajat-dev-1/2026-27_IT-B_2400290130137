import { z } from 'zod';
const schema1 = z.object({ trigger: z.enum(['manual']).optional() }).strict().optional().default({});
const schema2 = z.object({ trigger: z.enum(['manual']).optional() }).strict().default({});

console.log('Schema 1 with undefined:', schema1.parse(undefined));
console.log('Schema 2 with undefined:', schema2.parse(undefined));
