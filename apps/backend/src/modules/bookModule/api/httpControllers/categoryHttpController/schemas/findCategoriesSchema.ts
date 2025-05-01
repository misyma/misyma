import { type FindCategoriesQueryParams, type FindCategoriesResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { categoryDtoSchema } from '../../common/categoryDto.js';

export const findCategoriesQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindCategoriesQueryParamsDto = TypeExtends<
  Static<typeof findCategoriesQueryParamsDtoSchema>,
  FindCategoriesQueryParams
>;

export const findCategoriesResponseBodyDtoSchema = Type.Object({
  data: Type.Array(categoryDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindCategoriesResponseBodyDto = TypeExtends<
  Static<typeof findCategoriesResponseBodyDtoSchema>,
  FindCategoriesResponseBody
>;
