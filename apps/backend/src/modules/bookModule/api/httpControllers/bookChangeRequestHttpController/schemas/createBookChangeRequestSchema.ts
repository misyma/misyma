import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookChangeRequestDtoSchema } from '../../common/bookChangeRequestDto.js';

export const createBookChangeRequestBodyDtoSchema = Type.Object({
  title: Type.String({
    minLength: 1,
    maxLength: 64,
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
      minimum: 1500,
      maximum: 2500,
    }),
  ),
  language: Type.Enum(contracts.Language),
  translator: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 64,
    }),
  ),
  format: Type.Enum(contracts.BookChangeRequestFormat),
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
  authorIds: Type.Array(Type.String({ format: 'uuid' })),
});

export type CreateBookChangeRequestBodyDto = TypeExtends<Static<typeof createBookChangeRequestBodyDtoSchema>, contracts.CreateBookChangeRequestRequestBody>;

export const createBookChangeRequestResponseBodyDtoSchema = bookChangeRequestDtoSchema;

export type CreateBookChangeRequestResponseBodyDto = TypeExtends<
  Static<typeof createBookChangeRequestResponseBodyDtoSchema>,
  contracts.CreateBookChangeRequestResponseBody
>;
