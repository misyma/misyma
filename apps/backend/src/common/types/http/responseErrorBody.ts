import { z } from 'zod';

export const responseErrorBodySchema = z.object({
  error: z.object({
    name: z.string(),
    message: z.string(),
    context: z.record(z.string(), z.any()).optional(),
  }),
});

export type ResponseErrorBody = z.infer<typeof responseErrorBodySchema>;
