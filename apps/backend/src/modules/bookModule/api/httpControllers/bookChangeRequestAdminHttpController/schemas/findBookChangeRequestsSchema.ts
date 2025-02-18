import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookChangeRequestDtoSchema } from '../../common/bookChangeRequestDto.js';

export const findAdminBookChangeRequestsQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Enum(contracts.SortOrder)),
});

export type FindAdminBookChangeRequestsQueryParamsDto = TypeExtends<
  Static<typeof findAdminBookChangeRequestsQueryParamsDtoSchema>,
  contracts.FindAdminBookChangeRequestsQueryParams
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
  contracts.FindAdminBookChangeRequestsResponseBody,
  Static<typeof findAdminBookChangeRequestsResponseBodyDtoSchema>
>;
