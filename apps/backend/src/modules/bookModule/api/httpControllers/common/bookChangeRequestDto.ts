import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

export const bookChangeRequestDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  bookId: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  createdAt: Type.String({ format: 'date-time' }),
  title: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 64,
    }),
  ),
  isbn: Type.Optional(
    Type.String({
      pattern: '^(97(8|9))?\\d{9}(\\d|X)$',
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
  language: Type.Optional(Type.Enum(contracts.Language)),
  translator: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 64,
    }),
  ),
  format: Type.Optional(Type.Enum(contracts.BookFormat)),
  pages: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 10000,
    }),
  ),
  imageUrl: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 128,
    }),
  ),
});

export type BookChangeRequestDto = Static<typeof bookChangeRequestDtoSchema>;
