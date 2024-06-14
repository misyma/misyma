import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookChangeRequestDtoSchema } from '../../common/bookChangeRequestDto.js';

export const updateBookChangeRequestPathParamsDtoSchema = Type.Object({
  bookChangeRequestId: Type.String({ format: 'uuid' }),
});

export type UpdateBookChangeRequestPathParamsDto = TypeExtends<
  Static<typeof updateBookChangeRequestPathParamsDtoSchema>,
  contracts.UpdateBookChangeRequestPathParams
>;

export const updateBookChangeRequestBodyDtoSchema = Type.Object({
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
  format: Type.Optional(Type.Enum(contracts.BookChangeRequestFormat)),
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

export type UpdateBookChangeRequestBodyDto = TypeExtends<Static<typeof updateBookChangeRequestBodyDtoSchema>, contracts.UpdateBookChangeRequestRequestBody>;

export const updateBookChangeRequestResponseBodyDtoSchema = bookChangeRequestDtoSchema;

export type UpdateBookChangeRequestResponseBodyDto = TypeExtends<
  Static<typeof updateBookChangeRequestResponseBodyDtoSchema>,
  contracts.UpdateBookChangeRequestResponseBody
>;
