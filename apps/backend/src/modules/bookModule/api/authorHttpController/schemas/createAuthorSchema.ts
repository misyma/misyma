import { type Static, Type } from '@sinclair/typebox';

import { authorSchema } from './authorSchema.js';

export const createAuthorBodySchema = Type.Object({
  firstName: Type.String(),
  lastName: Type.String(),
});

export type CreateAuthorBody = Static<typeof createAuthorBodySchema>;

export const createAuthorResponseCreatedBodySchema = Type.Object({
  author: authorSchema,
});

export type CreateAuthorResponseCreatedBody = Static<typeof createAuthorResponseCreatedBodySchema>;
