import { z } from 'zod';
const scanBodySchema = z.object({
  trigger: z.enum(['manual']).optional(),
}).strict();

try {
  scanBodySchema.parse(undefined);
  console.log("undefined parsed successfully");
} catch (e) {
  console.error("undefined failed to parse");
}

try {
  scanBodySchema.parse({});
  console.log("{} parsed successfully");
} catch (e) {
  console.error("{} failed to parse");
}
