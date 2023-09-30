import { z } from 'zod';

export const loginUserBodySchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type LoginUserBody = z.infer<typeof loginUserBodySchema>;

export const loginUserResponseOkBodySchema = z.object({
  token: z.string(),
});

export type LoginUserResponseOkBody = z.infer<typeof loginUserResponseOkBodySchema>;
