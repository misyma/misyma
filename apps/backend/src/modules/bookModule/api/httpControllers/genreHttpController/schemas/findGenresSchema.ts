import { type FindGenresQueryParams, type FindGenresResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDtoSchema } from '../../common/genreDto.js';

export const findGenresQueryParamsDtoSchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1 })),
});

export type FindGenresQueryParamsDto = TypeExtends<
  Static<typeof findGenresQueryParamsDtoSchema>,
  FindGenresQueryParams
>;

export const findGenresResponseBodyDtoSchema = Type.Object({
  data: Type.Array(genreDtoSchema),
  metadata: Type.Object({
    page: Type.Integer({ minimum: 1 }),
    pageSize: Type.Integer({ minimum: 1 }),
    total: Type.Integer({ minimum: 0 }),
  }),
});

export type FindGenresResponseBodyDto = TypeExtends<
  Static<typeof findGenresResponseBodyDtoSchema>,
  FindGenresResponseBody
>;
