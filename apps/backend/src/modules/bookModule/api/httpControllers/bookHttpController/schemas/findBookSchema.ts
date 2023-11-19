import { type Static, Type } from '@sinclair/typebox';

import { bookSchema } from './bookSchema.js';

export const findBookPathParametersSchema = Type.Object({
  id: Type.String(),
});

export type FindBookPathParameters = Static<typeof findBookPathParametersSchema>;

export const findBookResponseOkBodySchema = Type.Object({
  book: bookSchema,
});

export type FindBookResponseOkBody = Static<typeof findBookResponseOkBodySchema>;
