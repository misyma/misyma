import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDTOSchema } from '../../common/bookDto.js';

export const findBooksQueryParamsDTOSchema = Type.Object({
  isbn: Type.Optional(
    Type.String({
      pattern: '^(97(8|9))?\\d{9}(\\d|X)$',
    }),
  ),
  title: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 64,
    }),
  ),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindBooksQueryParamsDTO = TypeExtends<
  Static<typeof findBooksQueryParamsDTOSchema>,
  contracts.FindBooksQueryParams
>;

export const findBooksResponseBodyDTOSchema = Type.Object({
  data: Type.Array(bookDTOSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindBooksResponseBodyDTO = TypeExtends<
  contracts.FindBooksResponseBody,
  Static<typeof findBooksResponseBodyDTOSchema>
>;
