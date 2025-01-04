import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDtoSchema, bookIsbnSchema, bookTitleSchema } from '../../common/bookDto.js';

export const findBooksQueryParamsDtoSchema = Type.Object({
  isbn: Type.Optional(bookIsbnSchema),
  title: Type.Optional(bookTitleSchema),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortField: Type.Optional(Type.Enum(contracts.FindBooksSortField)),
  sortOrder: Type.Optional(Type.Enum(contracts.SortOrder)),
});

export type FindBooksQueryParamsDto = TypeExtends<
  Static<typeof findBooksQueryParamsDtoSchema>,
  contracts.FindBooksQueryParams
>;

export const findBooksResponseBodyDtoSchema = Type.Object({
  data: Type.Array(bookDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindBooksResponseBodyDto = TypeExtends<
  contracts.FindBooksResponseBody,
  Static<typeof findBooksResponseBodyDtoSchema>
>;
