import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { bookshelfDtoSchema } from './bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookshelvesQueryParamsDtoSchema = Type.Object({
  name: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 64,
    }),
  ),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Enum(contracts.SortingType)),
});

export type FindBookshelvesQueryParamsDto = TypeExtends<
  Static<typeof findBookshelvesQueryParamsDtoSchema>,
  contracts.FindBookshelvesQueryParams
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
  contracts.FindBookshelvesResponseBody
>;
