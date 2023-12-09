import { type Static, Type } from '@sinclair/typebox';

import { authorSchema } from './authorSchema.js';

export const findAuthorPathParamsSchema = Type.Object({
  id: Type.String(),
});

export type FindAuthorPathParams = Static<typeof findAuthorPathParamsSchema>;

export const findAuthorResponseOkBodySchema = Type.Object({
  author: authorSchema,
});

export type FindAuthorResponseOkBody = Static<typeof findAuthorResponseOkBodySchema>;
