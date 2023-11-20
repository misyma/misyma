import { type Static, Type } from '@sinclair/typebox';

import { authorSchema } from './authorSchema.js';

export const findAuthorPathParametersSchema = Type.Object({
  id: Type.String(),
});

export type FindAuthorPathParameters = Static<typeof findAuthorPathParametersSchema>;

export const findAuthorResponseOkBodySchema = Type.Object({
  author: authorSchema,
});

export type FindAuthorResponseOkBody = Static<typeof findAuthorResponseOkBodySchema>;
