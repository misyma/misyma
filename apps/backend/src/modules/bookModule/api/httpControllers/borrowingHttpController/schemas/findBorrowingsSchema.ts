import {
  type FindBorrowingsPathParams,
  sortOrders,
  type FindBorrowingsQueryParams,
  type FindBorrowingsResponseBody,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { borrowingDtoSchema } from './borrowingDto.js';

export const findBorrowingsPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type FindBorrowingsPathParamsDto = TypeExtends<
  Static<typeof findBorrowingsPathParamsDtoSchema>,
  FindBorrowingsPathParams
>;

export const findBorrowingsQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Union(Object.values(sortOrders).map((sortOrder) => Type.Literal(sortOrder)))),
  isOpen: Type.Optional(Type.Boolean()),
});

export type FindBorrowingsQueryParamsDto = TypeExtends<
  Static<typeof findBorrowingsQueryParamsDtoSchema>,
  FindBorrowingsQueryParams
>;

export const findBorrowingsResponseBodyDtoSchema = Type.Object({
  data: Type.Array(borrowingDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindBorrowingsResponseBodyDto = TypeExtends<
  Static<typeof findBorrowingsResponseBodyDtoSchema>,
  FindBorrowingsResponseBody
>;
