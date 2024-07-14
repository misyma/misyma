import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDtoSchema } from '../../common/bookDto.js';

export const createBookBodyDtoSchema = Type.Object({
  title: Type.String({
    minLength: 1,
    maxLength: 256,
  }),
  isbn: Type.Optional(
    Type.String({
      pattern: '^(97(8|9))?\\d{9}(\\d|X)$',
    }),
  ),
  publisher: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 128,
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
  imageUrl: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 128,
    }),
  ),
  authorIds: Type.Array(Type.String({ format: 'uuid' })),
});

export type CreateBookBodyDto = TypeExtends<Static<typeof createBookBodyDtoSchema>, contracts.CreateBookRequestBody>;

export const createBookResponseBodyDtoSchema = bookDtoSchema;

export type CreateBookResponseBodyDto = TypeExtends<
  Static<typeof createBookResponseBodyDtoSchema>,
  contracts.CreateBookResponseBody
>;
