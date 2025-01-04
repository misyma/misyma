import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { authorDtoSchema } from './authorDto.js';

export const bookTitleSchema = Type.String({
  minLength: 1,
  maxLength: 256,
});

export const bookIsbnSchema = Type.String({
  pattern: '^(97(8|9))?\\d{9}(\\d|X)$',
});

export const bookPublisherSchema = Type.String({
  minLength: 1,
  maxLength: 128,
});

export const bookReleaseYearSchema = Type.Integer({
  minimum: 1,
  maximum: 2100,
});

export const bookTranslatorSchema = Type.String({
  minLength: 1,
  maxLength: 128,
});

export const bookImageUrlSchema = Type.String({
  minLength: 1,
  maxLength: 128,
});

export const bookPagesSchema = Type.Integer({
  minimum: 1,
  maximum: 10000,
});

export const bookDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  title: bookTitleSchema,
  isbn: Type.Optional(bookIsbnSchema),
  publisher: Type.Optional(bookPublisherSchema),
  releaseYear: bookReleaseYearSchema,
  language: Type.Enum(contracts.Language),
  translator: Type.Optional(bookTranslatorSchema),
  format: Type.Enum(contracts.BookFormat),
  pages: Type.Optional(bookPagesSchema),
  isApproved: Type.Boolean(),
  imageUrl: Type.Optional(bookImageUrlSchema),
  createdAt: Type.String({ format: 'date-time' }),
  authors: Type.Array(authorDtoSchema),
});

export type BookDto = Static<typeof bookDtoSchema>;
