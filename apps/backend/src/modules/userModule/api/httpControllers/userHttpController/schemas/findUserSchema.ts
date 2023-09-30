import { z } from 'zod';

import { userSchema } from './userSchema.js';

export const findUserPathParametersSchema = z.object({
  id: z.string(),
});

export type FindUserPathParameters = z.infer<typeof findUserPathParametersSchema>;

export const findUserResponseOkBodySchema = z.object({
  user: userSchema,
});

export type FindUserResponseOkBody = z.infer<typeof findUserResponseOkBodySchema>;
