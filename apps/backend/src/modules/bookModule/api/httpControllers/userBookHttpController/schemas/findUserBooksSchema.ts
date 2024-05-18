import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userBookDtoSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findUserBooksPathParamsDtoSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type FindUserBooksPathParamsDto = TypeExtends<
  contracts.FindUserBooksPathParams,
  Static<typeof findUserBooksPathParamsDtoSchema>
>;

export const findUserBooksQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
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
