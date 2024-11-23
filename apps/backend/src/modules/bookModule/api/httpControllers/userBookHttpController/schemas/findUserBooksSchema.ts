import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { userBookDtoSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookIsbnSchema } from '../../common/bookDto.js';

const expandFieldPattern = `^(${Object.values(contracts.UserBookExpandField).join('|')})(,(${Object.values(contracts.UserBookExpandField).join('|')}))*$`;

export const findUserBooksQueryParamsDtoSchema = Type.Object({
  userId: Type.Optional(Type.String({ format: 'uuid' })),
  bookshelfId: Type.Optional(Type.String({ format: 'uuid' })),
  collectionId: Type.Optional(Type.String({ format: 'uuid' })),
  isbn: Type.Optional(bookIsbnSchema),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Enum(contracts.SortingType)),
  expandFields: Type.Optional(Type.String({ pattern: expandFieldPattern })),
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
