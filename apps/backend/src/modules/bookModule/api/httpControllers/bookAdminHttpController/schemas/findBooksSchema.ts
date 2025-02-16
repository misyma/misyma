import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDtoSchema, bookIsbnSchema, bookReleaseYearSchema, bookTitleSchema } from '../../common/bookDto.js';

export const findAdminBooksQueryParamsDtoSchema = Type.Object({
  isbn: Type.Optional(bookIsbnSchema),
  title: Type.Optional(bookTitleSchema),
  authorIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
  language: Type.Optional(Type.Enum(contracts.Language)),
  isApproved: Type.Optional(Type.Boolean()),
  releaseYearBefore: Type.Optional(bookReleaseYearSchema),
  releaseYearAfter: Type.Optional(bookReleaseYearSchema),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortField: Type.Optional(Type.Enum(contracts.FindAdminBooksSortField)),
  sortOrder: Type.Optional(Type.Enum(contracts.SortOrder)),
});

export type FindAdminBooksQueryParamsDto = TypeExtends<
  Static<typeof findAdminBooksQueryParamsDtoSchema>,
  contracts.FindAdminBooksQueryParams
>;

export const findAdminBooksResponseBodyDtoSchema = Type.Object({
  data: Type.Array(bookDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindAdminBooksResponseBodyDto = TypeExtends<
  contracts.FindAdminBooksResponseBody,
  Static<typeof findAdminBooksResponseBodyDtoSchema>
>;
