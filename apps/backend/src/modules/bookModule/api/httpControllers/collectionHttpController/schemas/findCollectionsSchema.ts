import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { collectionDtoSchema } from '../../common/collectionDto.js';

export const findCollectionsQueryParamsDtoSchema = Type.Object({
  userId: Type.String({ format: 'uuid' }),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Enum(contracts.SortOrder)),
});

export type FindCollectionsQueryParamsDto = TypeExtends<
  Static<typeof findCollectionsQueryParamsDtoSchema>,
  contracts.FindCollectionsQueryParams
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
  contracts.FindCollectionsResponseBody
>;
