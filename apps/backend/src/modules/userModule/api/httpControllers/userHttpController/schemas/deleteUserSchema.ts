import { z } from 'zod';

export const deleteUserPathParametersSchema = z.object({
  id: z.string(),
});

export type DeleteUserPathParameters = z.infer<typeof deleteUserPathParametersSchema>;

export const deleteUserResponseNoContentBodySchema = z.null();

export type DeleteUserResponseNoContentBody = z.infer<typeof deleteUserResponseNoContentBodySchema>;
