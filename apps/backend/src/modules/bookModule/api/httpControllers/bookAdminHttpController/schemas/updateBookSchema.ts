import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDtoSchema } from '../../common/bookDto.js';

export const updateBookPathParamsDtoSchema = Type.Object({
  bookId: Type.String({ format: 'uuid' }),
});

export type UpdateBookPathParamsDto = TypeExtends<
  Static<typeof updateBookPathParamsDtoSchema>,
  contracts.UpdateBookPathParams
>;

export const updateBookBodyDtoSchema = Type.Object({
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
  isApproved: Type.Optional(Type.Boolean()),
  authorIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
});

export type UpdateBookBodyDto = TypeExtends<Static<typeof updateBookBodyDtoSchema>, contracts.UpdateBookRequestBody>;

export const updateBookResponseBodyDtoSchema = bookDtoSchema;

export type UpdateBookResponseBodyDto = TypeExtends<
  Static<typeof updateBookResponseBodyDtoSchema>,
  contracts.UpdateBookResponseBody
>;
