import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDTOSchema } from '../../common/genreDto.js';

export const findGenresQueryParamsDTOSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindGenresQueryParamsDTO = TypeExtends<
  Static<typeof findGenresQueryParamsDTOSchema>,
  contracts.FindGenresQueryParams
>;

export const findGenresResponseBodyDTOSchema = Type.Object({
  data: Type.Array(genreDTOSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindGenresResponseBodyDTO = TypeExtends<
  Static<typeof findGenresResponseBodyDTOSchema>,
  contracts.FindGenresResponseBody
>;
