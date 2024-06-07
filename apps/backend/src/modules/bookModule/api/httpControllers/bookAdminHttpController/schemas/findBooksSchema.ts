import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDtoSchema } from '../../common/bookDto.js';

export const findAdminBooksQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindAdminBooksQueryParamsDto = TypeExtends<
  Static<typeof findAdminBooksQueryParamsDtoSchema>,
  contracts.FindBooksQueryParams
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
  contracts.FindBooksResponseBody,
  Static<typeof findAdminBooksResponseBodyDtoSchema>
>;
