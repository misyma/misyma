import { type FindBookChangeRequestsQueryParams, type FindBookChangeRequestsResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookChangeRequestDtoSchema } from '../../common/bookChangeRequestDto.js';

export const findBookChangeRequestsQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindBookChangeRequestsQueryParamsDto = TypeExtends<
  Static<typeof findBookChangeRequestsQueryParamsDtoSchema>,
  FindBookChangeRequestsQueryParams
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
  FindBookChangeRequestsResponseBody,
  Static<typeof findBookChangeRequestsResponseBodyDtoSchema>
>;
