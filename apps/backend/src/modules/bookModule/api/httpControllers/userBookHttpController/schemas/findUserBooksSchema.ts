import {
  languages,
  type FindUserBooksQueryParams,
  type FindUserBooksResponseBody,
  sortOrders,
  readingStatuses,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookIsbnSchema, bookTitleSchema } from '../../common/bookDto.js';

import { userBookDtoSchema } from './userBookDto.js';

export const findUserBooksQueryParamsDtoSchema = Type.Object({
  bookshelfId: Type.Optional(Type.String({ format: 'uuid' })),
  collectionId: Type.Optional(Type.String({ format: 'uuid' })),
  authorId: Type.Optional(Type.String({ format: 'uuid' })),
  genreId: Type.Optional(Type.String({ format: 'uuid' })),
  isbn: Type.Optional(bookIsbnSchema),
  title: Type.Optional(bookTitleSchema),
  status: Type.Optional(Type.Union(Object.values(readingStatuses).map((status) => Type.Literal(status)))),
  language: Type.Optional(Type.Union(Object.values(languages).map((language) => Type.Literal(language)))),
  isFavorite: Type.Optional(Type.Boolean()),
  releaseYearBefore: Type.Optional(Type.Integer({ minimum: 1 })),
  releaseYearAfter: Type.Optional(Type.Integer({ minimum: 1 })),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortField: Type.Optional(
    Type.Union([
      Type.Literal('releaseYear'),
      Type.Literal('createdAt'),
      Type.Literal('rating'),
      Type.Literal('readingDate'),
    ]),
  ),
  sortOrder: Type.Optional(Type.Union(Object.values(sortOrders).map((sortOrder) => Type.Literal(sortOrder)))),
  isRated: Type.Optional(Type.Boolean()),
});

export type FindUserBooksQueryParamsDto = TypeExtends<
  FindUserBooksQueryParams,
  Static<typeof findUserBooksQueryParamsDtoSchema>
>;

export const findUserBooksResponseBodyDtoSchema = Type.Object({
  data: Type.Array(userBookDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindUserBooksResponseBodyDto = TypeExtends<
  FindUserBooksResponseBody,
  Static<typeof findUserBooksResponseBodyDtoSchema>
>;
