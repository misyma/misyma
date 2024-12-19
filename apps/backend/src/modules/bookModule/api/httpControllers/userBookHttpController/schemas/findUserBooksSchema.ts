import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { userBookDtoSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookIsbnSchema, bookTitleSchema } from '../../common/bookDto.js';

const expandFieldPattern = `^(${Object.values(contracts.UserBookExpandField).join('|')})(,(${Object.values(contracts.UserBookExpandField).join('|')}))*$`;

export const findUserBooksQueryParamsDtoSchema = Type.Object({
  bookshelfId: Type.Optional(Type.String({ format: 'uuid' })),
  collectionId: Type.Optional(Type.String({ format: 'uuid' })),
  authorId: Type.Optional(Type.String({ format: 'uuid' })),
  isbn: Type.Optional(bookIsbnSchema),
  title: Type.Optional(bookTitleSchema),
  status: Type.Optional(Type.Enum(contracts.ReadingStatus)),
  isFavorite: Type.Optional(Type.Boolean()),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Enum(contracts.SortingType)),
  expandFields: Type.Optional(Type.String({ pattern: expandFieldPattern })),
  releaseYearAfter: Type.Optional(Type.Integer({ minimum: 1 })),
  language: Type.Optional(Type.Enum(contracts.Language)),
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
