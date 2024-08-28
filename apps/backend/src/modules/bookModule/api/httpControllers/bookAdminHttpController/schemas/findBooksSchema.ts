import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDtoSchema } from '../../common/bookDto.js';

export const findAdminBooksQueryParamsDtoSchema = Type.Object({
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
  authorIds: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
  language: Type.Optional(Type.Enum(contracts.Language)),
  isApproved: Type.Optional(Type.Boolean()),
  releaseYearBefore: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 2100,
    }),
  ),
  releaseYearAfter: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: 2100,
    }),
  ),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindAdminBooksQueryParamsDto = TypeExtends<
  Static<typeof findAdminBooksQueryParamsDtoSchema>,
  contracts.FindAdminBooksQueryParams
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
  contracts.FindAdminBooksResponseBody,
  Static<typeof findAdminBooksResponseBodyDtoSchema>
>;
