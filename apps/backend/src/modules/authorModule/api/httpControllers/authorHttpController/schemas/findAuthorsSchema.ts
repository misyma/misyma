import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { authorDTOSchema } from '../../common/authorDto.js';

export const findAuthorsQueryParamsDTOSchema = Type.Object({
  name: Type.Optional(
    Type.String({
      minLength: 1,
      maxLength: 128,
    }),
  ),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindAuthorsQueryParamsDTO = TypeExtends<
  Static<typeof findAuthorsQueryParamsDTOSchema>,
  contracts.FindAuthorsQueryParams
>;

export const findAuthorsResponseBodyDTOSchema = Type.Object({
  data: Type.Array(authorDTOSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindAuthorsResponseBodyDTO = TypeExtends<
  Static<typeof findAuthorsResponseBodyDTOSchema>,
  contracts.FindAuthorsResponseBody
>;
