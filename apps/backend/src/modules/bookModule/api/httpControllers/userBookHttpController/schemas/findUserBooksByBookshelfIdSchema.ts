import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userBookDtoSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findUserBooksByBookshelfIdPathParamsDtoSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type FindUserBooksByBookshelfIdPathParamsDto = TypeExtends<
  contracts.FindUserBooksByBookshelfIdPathParams,
  Static<typeof findUserBooksByBookshelfIdPathParamsDtoSchema>
>;

export const findUserBooksByBookshelfIdQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindUserBooksByBookshelfIdQueryParamsDto = TypeExtends<
  contracts.FindUserBooksByBookshelfIdQueryParams,
  Static<typeof findUserBooksByBookshelfIdQueryParamsDtoSchema>
>;

export const findUserBooksByBookshelfIdResponseBodyDtoSchema = Type.Object({
  data: Type.Array(userBookDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindUserBooksByBookshelfIdResponseBodyDto = TypeExtends<
  contracts.FindUserBooksByBookshelfIdResponseBody,
  Static<typeof findUserBooksByBookshelfIdResponseBodyDtoSchema>
>;
