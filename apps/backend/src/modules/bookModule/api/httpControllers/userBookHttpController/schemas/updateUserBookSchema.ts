import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { userBookDtoSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateUserBookPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type UpdateUserBookPathParamsDto = TypeExtends<
  Static<typeof updateUserBookPathParamsDtoSchema>,
  contracts.UpdateUserBookPathParams
>;

export const updateUserBookBodyDtoSchema = Type.Object({
  status: Type.Optional(Type.Enum(contracts.ReadingStatus)),
  isFavorite: Type.Optional(Type.Boolean()),
  bookshelfId: Type.Optional(Type.String({ format: 'uuid' })),
  imageUrl: Type.Optional(
    Type.Union([
      Type.String({
        minLength: 1,
        maxLength: 128,
      }),
      Type.Null(),
    ]),
  ),
  genreIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
  collectionIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
});

export type UpdateUserBookBodyDto = TypeExtends<
  Static<typeof updateUserBookBodyDtoSchema>,
  contracts.UpdateUserBookRequestBody
>;

export const updateUserBookResponseBodyDtoSchema = userBookDtoSchema;

export type UpdateUserBookResponseBodyDto = TypeExtends<
  Static<typeof updateUserBookResponseBodyDtoSchema>,
  contracts.UpdateUserBookResponseBody
>;
