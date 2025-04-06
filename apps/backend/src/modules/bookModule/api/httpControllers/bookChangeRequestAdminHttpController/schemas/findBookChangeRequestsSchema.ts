import {
  type FindAdminBookChangeRequestsQueryParams,
  type FindAdminBookChangeRequestsResponseBody,
  sortOrders,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookChangeRequestDtoSchema } from '../../common/bookChangeRequestDto.js';

export const findAdminBookChangeRequestsQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Union(Object.values(sortOrders).map((sortOrder) => Type.Literal(sortOrder)))),
});

export type FindAdminBookChangeRequestsQueryParamsDto = TypeExtends<
  Static<typeof findAdminBookChangeRequestsQueryParamsDtoSchema>,
  FindAdminBookChangeRequestsQueryParams
>;

export const findAdminBookChangeRequestsResponseBodyDtoSchema = Type.Object({
  data: Type.Array(bookChangeRequestDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindAdminBookChangeRequestsResponseBodyDto = TypeExtends<
  FindAdminBookChangeRequestsResponseBody,
  Static<typeof findAdminBookChangeRequestsResponseBodyDtoSchema>
>;
