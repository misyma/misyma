import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDtoSchema } from '../../common/bookDto.js';

export const findBooksQueryParamsDtoSchema = Type.Object({
  isbn: Type.Optional(
    Type.String({
      pattern: '^(97(8|9))?\\d{9}(\\d|X)$',
    }),
  ),
  title: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 256,
    }),
  ),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Enum(contracts.SortingType)),
});

export type FindBooksQueryParamsDto = TypeExtends<
  Static<typeof findBooksQueryParamsDtoSchema>,
  contracts.FindBooksQueryParams
>;

export const findBooksResponseBodyDtoSchema = Type.Object({
  data: Type.Array(bookDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindBooksResponseBodyDto = TypeExtends<
  contracts.FindBooksResponseBody,
  Static<typeof findBooksResponseBodyDtoSchema>
>;
