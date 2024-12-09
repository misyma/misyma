import { type Static, Type } from '@sinclair/typebox';

import * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { authorDtoSchema, authorNameSchema } from '../../../../../bookModule/api/httpControllers/common/authorDto.js';

export const findAuthorsQueryParamsDtoSchema = Type.Object({
  name: Type.Optional(authorNameSchema),
  ids: Type.Optional(Type.Array(Type.String({ format: 'uuid' }))),
  userId: Type.Optional(Type.String({ format: 'uuid' })),
  bookshelfId: Type.Optional(Type.String({ format: 'uuid' })),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
  sortDate: Type.Optional(Type.Enum(contracts.SortingType)),
});

export type FindAuthorsQueryParamsDto = TypeExtends<
  Static<typeof findAuthorsQueryParamsDtoSchema>,
  contracts.FindAuthorsQueryParams
>;

export const findAuthorsResponseBodyDtoSchema = Type.Object({
  data: Type.Array(authorDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindAuthorsResponseBodyDto = TypeExtends<
  Static<typeof findAuthorsResponseBodyDtoSchema>,
  contracts.FindAuthorsResponseBody
>;
