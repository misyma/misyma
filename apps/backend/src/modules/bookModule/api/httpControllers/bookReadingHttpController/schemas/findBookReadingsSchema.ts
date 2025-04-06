import {
  type FindBookReadingsPathParams,
  type FindBookReadingsQueryParams,
  type FindBookReadingsResponseBody,
  sortOrders,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { bookReadingDtoSchema } from './bookReadingDto.js';

export const findBookReadingsPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type FindBookReadingsPathParamsDto = TypeExtends<
  Static<typeof findBookReadingsPathParamsDtoSchema>,
  FindBookReadingsPathParams
>;

export const findBookReadingsQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Union(Object.values(sortOrders).map((sortOrder) => Type.Literal(sortOrder)))),
});

export type FindBookReadingsQueryParamsDto = TypeExtends<
  Static<typeof findBookReadingsQueryParamsDtoSchema>,
  FindBookReadingsQueryParams
>;

export const findBookReadingsResponseBodyDtoSchema = Type.Object({
  data: Type.Array(bookReadingDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindBookReadingsResponseBodyDto = TypeExtends<
  Static<typeof findBookReadingsResponseBodyDtoSchema>,
  FindBookReadingsResponseBody
>;
