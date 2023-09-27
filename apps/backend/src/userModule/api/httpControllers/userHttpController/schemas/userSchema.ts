import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
});
