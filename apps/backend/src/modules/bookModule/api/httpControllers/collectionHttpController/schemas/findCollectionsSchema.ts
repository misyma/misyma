import { type FindCollectionsQueryParams, type FindCollectionsResponseBody, sortOrders } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { collectionDtoSchema } from '../../common/collectionDto.js';

export const findCollectionsQueryParamsDtoSchema = Type.Object({
  userId: Type.String({ format: 'uuid' }),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Union(Object.values(sortOrders).map((sortOrder) => Type.Literal(sortOrder)))),
});

export type FindCollectionsQueryParamsDto = TypeExtends<
  Static<typeof findCollectionsQueryParamsDtoSchema>,
  FindCollectionsQueryParams
>;

export const findCollectionsResponseBodyDtoSchema = Type.Object({
  data: Type.Array(collectionDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindCollectionsResponseBodyDto = TypeExtends<
  Static<typeof findCollectionsResponseBodyDtoSchema>,
  FindCollectionsResponseBody
>;
