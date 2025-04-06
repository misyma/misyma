import { sortOrders, type FindBookshelvesQueryParams, type FindBookshelvesResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { bookshelfDtoSchema } from './bookshelfDto.js';

export const findBookshelvesQueryParamsDtoSchema = Type.Object({
  name: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 64,
    }),
  ),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Union(Object.values(sortOrders).map((sortOrder) => Type.Literal(sortOrder)))),
});

export type FindBookshelvesQueryParamsDto = TypeExtends<
  Static<typeof findBookshelvesQueryParamsDtoSchema>,
  FindBookshelvesQueryParams
>;

export const findBookshelvesResponseBodyDtoSchema = Type.Object({
  data: Type.Array(bookshelfDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindBookshelvesResponseBodyDto = TypeExtends<
  Static<typeof findBookshelvesResponseBodyDtoSchema>,
  FindBookshelvesResponseBody
>;
