import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { borrowingDtoSchema } from './borrowingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBorrowingsPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type FindBorrowingsPathParamsDto = TypeExtends<
  Static<typeof findBorrowingsPathParamsDtoSchema>,
  contracts.FindBorrowingsPathParams
>;

export const findBorrowingsQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Enum(contracts.SortingType)),
  isOpen: Type.Optional(Type.Boolean()),
});

export type FindBorrowingsQueryParamsDto = TypeExtends<
  Static<typeof findBorrowingsQueryParamsDtoSchema>,
  contracts.FindBorrowingsQueryParams
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
  contracts.FindBorrowingsResponseBody
>;
