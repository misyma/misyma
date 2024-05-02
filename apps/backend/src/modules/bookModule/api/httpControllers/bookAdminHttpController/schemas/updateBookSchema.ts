import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDTOSchema } from '../../common/bookDto.js';

export const updateBookPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type UpdateBookPathParamsDTO = TypeExtends<
  Static<typeof updateBookPathParamsDTOSchema>,
  contracts.UpdateBookPathParams
>;

export const updateBookBodyDTOSchema = Type.Object({
  title: Type.Optional(
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
  authorIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
});

export type UpdateBookBodyDTO = TypeExtends<Static<typeof updateBookBodyDTOSchema>, contracts.UpdateBookRequestBody>;

export const updateBookResponseBodyDTOSchema = bookDTOSchema;

export type UpdateBookResponseBodyDTO = TypeExtends<
  Static<typeof updateBookResponseBodyDTOSchema>,
  contracts.UpdateBookResponseBody
>;
