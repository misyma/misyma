import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { userBookDtoSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookIsbnSchema, bookTitleSchema } from '../../common/bookDto.js';

export const findUserBooksQueryParamsDtoSchema = Type.Object({
  bookshelfId: Type.Optional(Type.String({ format: 'uuid' })),
  collectionId: Type.Optional(Type.String({ format: 'uuid' })),
  authorId: Type.Optional(Type.String({ format: 'uuid' })),
  genreId: Type.Optional(Type.String({ format: 'uuid' })),
  isbn: Type.Optional(bookIsbnSchema),
  title: Type.Optional(bookTitleSchema),
  status: Type.Optional(Type.Enum(contracts.ReadingStatus)),
  language: Type.Optional(Type.Enum(contracts.Language)),
  isFavorite: Type.Optional(Type.Boolean()),
  releaseYearBefore: Type.Optional(Type.Integer({ minimum: 1 })),
  releaseYearAfter: Type.Optional(Type.Integer({ minimum: 1 })),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortField: Type.Optional(Type.Enum(contracts.FindUserBooksSortField)),
  sortOrder: Type.Optional(Type.Enum(contracts.SortOrder)),
});

export type FindUserBooksQueryParamsDto = TypeExtends<
  contracts.FindUserBooksQueryParams,
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
  contracts.FindUserBooksResponseBody,
  Static<typeof findUserBooksResponseBodyDtoSchema>
>;
