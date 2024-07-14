import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { authorDtoSchema } from './authorDto.js';

export const bookDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  title: Type.String({
    minLength: 1,
    maxLength: 128,
  }),
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
      minimum: 1,
      maximum: 2100,
    }),
  ),
  language: Type.Enum(contracts.Language),
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
  imageUrl: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 128,
    }),
  ),
  authors: Type.Array(authorDtoSchema),
});

export type BookDto = Static<typeof bookDtoSchema>;
