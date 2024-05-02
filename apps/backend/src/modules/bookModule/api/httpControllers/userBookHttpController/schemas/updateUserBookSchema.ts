import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { userBookDTOSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const updateUserBookPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type UpdateUserBookPathParamsDTO = TypeExtends<
  Static<typeof updateUserBookPathParamsDTOSchema>,
  contracts.UpdateUserBookPathParams
>;

export const updateUserBookBodyDTOSchema = Type.Object({
  status: Type.Optional(Type.Enum(contracts.ReadingStatus)),
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
});

export type UpdateUserBookBodyDTO = TypeExtends<
  Static<typeof updateUserBookBodyDTOSchema>,
  contracts.UpdateUserBookRequestBody
>;

export const updateUserBookResponseBodyDTOSchema = userBookDTOSchema;

export type UpdateUserBookResponseBodyDTO = TypeExtends<
  Static<typeof updateUserBookResponseBodyDTOSchema>,
  contracts.UpdateUserBookResponseBody
>;
