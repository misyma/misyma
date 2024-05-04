import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDtoSchema } from './bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookshelvesByUserIdQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindBookshelvesByUserIdQueryParamsDto = TypeExtends<
  Static<typeof findBookshelvesByUserIdQueryParamsDtoSchema>,
  contracts.FindBookshelvesByUserIdQueryParams
>;

export const findBookshelvesByUserIdResponseBodyDtoSchema = Type.Object({
  data: Type.Array(bookshelfDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindBookshelvesByUserIdResponseBodyDto = TypeExtends<
  Static<typeof findBookshelvesByUserIdResponseBodyDtoSchema>,
  contracts.FindBookshelvesByUserIdResponseBody
>;
