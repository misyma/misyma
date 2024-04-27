import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userBookDTOSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findUserBooksByBookshelfIdPathParamsDTOSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type FindUserBooksByBookshelfIdPathParamsDTO = TypeExtends<
  contracts.FindUserBooksByBookshelfIdPathParams,
  Static<typeof findUserBooksByBookshelfIdPathParamsDTOSchema>
>;

export const findUserBooksByBookshelfIdQueryParamsDTOSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindUserBooksByBookshelfIdQueryParamsDTO = TypeExtends<
  contracts.FindUserBooksByBookshelfIdQueryParams,
  Static<typeof findUserBooksByBookshelfIdQueryParamsDTOSchema>
>;

export const findUserBooksByBookshelfIdResponseBodyDTOSchema = Type.Object({
  data: Type.Array(userBookDTOSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindUserBooksByBookshelfIdResponseBodyDTO = TypeExtends<
  contracts.FindUserBooksByBookshelfIdResponseBody,
  Static<typeof findUserBooksByBookshelfIdResponseBodyDTOSchema>
>;
