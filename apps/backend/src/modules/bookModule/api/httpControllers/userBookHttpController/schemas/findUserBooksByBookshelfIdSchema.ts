import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userBookDTOSchema } from './userBookDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findUserBooksByBookshelfIdPathParamsDTOSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type FindUserBooksByBookshelfIdPathParamsDTO = TypeExtends<
  contracts.FindUserBooksByBookshelfIdPathParams,
  Static<typeof findUserBooksByBookshelfIdPathParamsDTOSchema>
>;

export const findUserBooksByBookshelfIdResponseBodyDTOSchema = Type.Object({
  data: Type.Array(userBookDTOSchema),
});

export type FindUserBooksByBookshelfIdResponseBodyDTO = TypeExtends<
  contracts.FindUserBooksByBookshelfIdResponseBody,
  Static<typeof findUserBooksByBookshelfIdResponseBodyDTOSchema>
>;
