import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookChangeRequestDtoSchema } from '../../common/bookChangeRequestDto.js';

export const findBookChangeRequestsQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindBookChangeRequestsQueryParamsDto = TypeExtends<
  Static<typeof findBookChangeRequestsQueryParamsDtoSchema>,
  contracts.FindBookChangeRequestsQueryParams
>;

export const findBookChangeRequestsResponseBodyDtoSchema = Type.Object({
  data: Type.Array(bookChangeRequestDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindBookChangeRequestsResponseBodyDto = TypeExtends<
  contracts.FindBookChangeRequestsResponseBody,
  Static<typeof findBookChangeRequestsResponseBodyDtoSchema>
>;
