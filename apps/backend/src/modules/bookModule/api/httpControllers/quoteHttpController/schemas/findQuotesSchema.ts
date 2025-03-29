import * as contracts from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { quoteDtoSchema } from './quoteDto.js';

export const findQuotesQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Enum(contracts.SortOrder)),
  authorId: Type.Optional(Type.String({ format: 'uuid' })),
  userBookId: Type.Optional(Type.String({ format: 'uuid' })),
  isFavorite: Type.Optional(Type.Boolean()),
});

export type FindQuotesQueryParamsDto = TypeExtends<
  Static<typeof findQuotesQueryParamsDtoSchema>,
  contracts.FindQuotesQueryParams
>;

export const findQuotesResponseBodyDtoSchema = Type.Object({
  data: Type.Array(quoteDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindQuotesResponseBodyDto = TypeExtends<
  Static<typeof findQuotesResponseBodyDtoSchema>,
  contracts.FindQuotesResponseBody
>;
