import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { quoteDtoSchema } from './quoteDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findQuotesPathParamsDtoSchema = Type.Object({
  userId: Type.String(),
  userBookId: Type.String({ format: 'uuid' }),
});

export type FindQuotesPathParamsDto = TypeExtends<
  Static<typeof findQuotesPathParamsDtoSchema>,
  contracts.FindQuotesPathParams
>;

export const findQuotesQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
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
