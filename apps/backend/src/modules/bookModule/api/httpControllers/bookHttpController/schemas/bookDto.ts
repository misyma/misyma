import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

export const bookDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  title: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
  isbn: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 64,
    }),
  ),
  publisher: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 64,
    }),
  ),
  releaseYear: Type.Optional(
    Type.Integer({
      minimum: 1500,
      maximum: 2500,
    }),
  ),
  language: Type.String(
    Type.String({
      minLength: 1,
      maxLength: 64,
    }),
  ),
  translator: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 64,
    }),
  ),
  format: Type.Enum(contracts.BookFormat),
  pages: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 10000,
    }),
  ),
  isApproved: Type.Boolean(),
  authors: Type.Array(
    Type.Object({
      id: Type.String({ format: 'uuid' }),
      name: Type.String({
        minLength: 1,
        maxLength: 128,
      }),
      isApproved: Type.Boolean(),
    }),
  ),
});

export type BookDTO = Static<typeof bookDTOSchema>;
