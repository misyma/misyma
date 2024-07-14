import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookChangeRequestDtoSchema } from '../../common/bookChangeRequestDto.js';

export const createBookChangeRequestBodyDtoSchema = Type.Object({
  bookId: Type.String({ format: 'uuid' }),
  title: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 128,
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
      minimum: 1,
      maximum: 2100,
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

export type CreateBookChangeRequestBodyDto = TypeExtends<
  Static<typeof createBookChangeRequestBodyDtoSchema>,
  contracts.CreateBookChangeRequestRequestBody
>;

export const createBookChangeRequestResponseBodyDtoSchema = bookChangeRequestDtoSchema;

export type CreateBookChangeRequestResponseBodyDto = TypeExtends<
  Static<typeof createBookChangeRequestResponseBodyDtoSchema>,
  contracts.CreateBookChangeRequestResponseBody
>;
