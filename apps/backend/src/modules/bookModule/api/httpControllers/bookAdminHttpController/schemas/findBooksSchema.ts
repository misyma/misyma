import {
  type FindAdminBooksQueryParams,
  type FindAdminBooksResponseBody,
  languages,
  sortOrders,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDtoSchema, bookIsbnSchema, bookReleaseYearSchema, bookTitleSchema } from '../../common/bookDto.js';

export const findAdminBooksQueryParamsDtoSchema = Type.Object({
  isbn: Type.Optional(bookIsbnSchema),
  title: Type.Optional(bookTitleSchema),
  authorIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
  language: Type.Optional(Type.Union(Object.values(languages).map((language) => Type.Literal(language)))),
  isApproved: Type.Optional(Type.Boolean()),
  releaseYearBefore: Type.Optional(bookReleaseYearSchema),
  releaseYearAfter: Type.Optional(bookReleaseYearSchema),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortField: Type.Optional(Type.Union([Type.Literal('releaseYear'), Type.Literal('createdAt'), Type.Literal('title')])),
  sortOrder: Type.Optional(Type.Union(Object.values(sortOrders).map((sortOrder) => Type.Literal(sortOrder)))),
});

export type FindAdminBooksQueryParamsDto = TypeExtends<
  Static<typeof findAdminBooksQueryParamsDtoSchema>,
  FindAdminBooksQueryParams
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
  FindAdminBooksResponseBody,
  Static<typeof findAdminBooksResponseBodyDtoSchema>
>;
