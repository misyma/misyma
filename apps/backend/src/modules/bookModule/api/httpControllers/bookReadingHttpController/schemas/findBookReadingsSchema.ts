import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookReadingDTOSchema } from './bookReadingDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookReadingsPathParamsDTOSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type FindBookReadingsPathParamsDTO = TypeExtends<
  Static<typeof findBookReadingsPathParamsDTOSchema>,
  contracts.FindBookReadingsPathParams
>;

export const findBookReadingsQueryParamsDTOSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindBookReadingsQueryParamsDTO = TypeExtends<
  Static<typeof findBookReadingsQueryParamsDTOSchema>,
  contracts.FindBookReadingsQueryParams
>;

export const findBookReadingsResponseBodyDTOSchema = Type.Object({
  data: Type.Array(bookReadingDTOSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindBookReadingsResponseBodyDTO = TypeExtends<
  Static<typeof findBookReadingsResponseBodyDTOSchema>,
  contracts.FindBookReadingsResponseBody
>;
