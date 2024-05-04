import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDtoSchema } from './bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookReadingsPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type FindBookReadingsPathParamsDto = TypeExtends<
  Static<typeof findBookReadingsPathParamsDtoSchema>,
  contracts.FindBookReadingsPathParams
>;

export const findBookReadingsQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindBookReadingsQueryParamsDto = TypeExtends<
  Static<typeof findBookReadingsQueryParamsDtoSchema>,
  contracts.FindBookReadingsQueryParams
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
  contracts.FindBookReadingsResponseBody
>;
