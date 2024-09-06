import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { userBookDtoSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findUserBooksQueryParamsDtoSchema = Type.Object({
  bookshelfId: Type.Optional(Type.String({ format: 'uuid' })),
  collectionId: Type.Optional(Type.String({ format: 'uuid' })),
  isbn: Type.Optional(
    Type.String({
      pattern: '^(97(8|9))?\\d{9}(\\d|X)$',
    }),
  ),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Enum(contracts.SortingType)),
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
