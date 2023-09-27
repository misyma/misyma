import { z } from 'zod';

import { userSchema } from './userSchema.js';

export const registerUserBodySchema = z.object({
  email: z.string(),
  password: z.string(),
});

export type RegisterUserBody = z.infer<typeof registerUserBodySchema>;

export const registerUserResponseCreatedBodySchema = z.object({
  user: userSchema,
});

export type RegisterUserResponseCreatedBody = z.infer<typeof registerUserResponseCreatedBodySchema>;
