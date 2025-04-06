import { type FindAuthorsQueryParams, type FindAuthorsResponseBody, sortOrders } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { authorDtoSchema, authorNameSchema } from '../../common/authorDto.js';

export const findAdminAuthorsQueryParamsDtoSchema = Type.Object({
  name: Type.Optional(authorNameSchema),
  ids: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
  isApproved: Type.Optional(Type.Boolean()),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortField: Type.Optional(Type.Union([Type.Literal('createdAt'), Type.Literal('name')])),
  sortOrder: Type.Optional(Type.Union(Object.values(sortOrders).map((sortOrder) => Type.Literal(sortOrder)))),
});

export type FindAdminAuthorsQueryParamsDto = TypeExtends<
  Static<typeof findAdminAuthorsQueryParamsDtoSchema>,
  FindAuthorsQueryParams
>;

export const findAdminAuthorsResponseBodyDtoSchema = Type.Object({
  data: Type.Array(authorDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindAdminAuthorsResponseBodyDto = TypeExtends<
  Static<typeof findAdminAuthorsResponseBodyDtoSchema>,
  FindAuthorsResponseBody
>;
