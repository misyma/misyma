import { type FindBooksQueryParams, type FindBooksResponseBody, sortOrders } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDtoSchema, bookIsbnSchema, bookTitleSchema } from '../../common/bookDto.js';

export const findBooksQueryParamsDtoSchema = Type.Object({
  isbn: Type.Optional(bookIsbnSchema),
  title: Type.Optional(bookTitleSchema),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortField: Type.Optional(Type.Union([Type.Literal('releaseYear'), Type.Literal('createdAt')])),
  sortOrder: Type.Optional(Type.Union(Object.values(sortOrders).map((sortOrder) => Type.Literal(sortOrder)))),
});

export type FindBooksQueryParamsDto = TypeExtends<Static<typeof findBooksQueryParamsDtoSchema>, FindBooksQueryParams>;

export const findBooksResponseBodyDtoSchema = Type.Object({
  data: Type.Array(bookDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindBooksResponseBodyDto = TypeExtends<
  FindBooksResponseBody,
  Static<typeof findBooksResponseBodyDtoSchema>
>;
