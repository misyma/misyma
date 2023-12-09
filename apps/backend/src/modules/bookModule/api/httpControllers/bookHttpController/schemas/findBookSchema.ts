import { type Static, Type } from '@sinclair/typebox';

import { bookSchema } from './bookSchema.js';

export const findBookPathParamsSchema = Type.Object({
  id: Type.String(),
});

export type FindBookPathParams = Static<typeof findBookPathParamsSchema>;

export const findBookResponseOkBodySchema = Type.Object({
  book: bookSchema,
});

export type FindBookResponseOkBody = Static<typeof findBookResponseOkBodySchema>;
