import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDTOSchema } from './bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookshelvesByUserIdPathParamsDTOSchema = Type.Object({
  userId: Type.String({ format: 'uuid' }),
});

export type FindBookshelvesByUserIdPathParamsDTO = TypeExtends<
  Static<typeof findBookshelvesByUserIdPathParamsDTOSchema>,
  contracts.FindBookshelvesByUserIdParams
>;

export const findBookshelvesByUserIdQueryParamsDTOSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindBookshelvesByUserIdQueryParamsDTO = TypeExtends<
  Static<typeof findBookshelvesByUserIdQueryParamsDTOSchema>,
  contracts.FindBookshelvesByUserIdQueryParams
>;

export const findBookshelvesByUserIdResponseBodyDTOSchema = Type.Object({
  data: Type.Array(bookshelfDTOSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindBookshelvesByUserIdResponseBodyDTO = TypeExtends<
  Static<typeof findBookshelvesByUserIdResponseBodyDTOSchema>,
  contracts.FindBookshelvesByUserIdResponseBody
>;
