import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDtoSchema } from '../../common/genreDto.js';

export const findGenreByNamePathParamsDtoSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type FindGenreByNamePathParamsDto = TypeExtends<
  contracts.FindGenreByNamePathParams,
  Static<typeof findGenreByNamePathParamsDtoSchema>
>;

export const findGenreByNameResponseBodyDtoSchema = genreDtoSchema;

export type FindGenreByNameResponseBodyDto = TypeExtends<
  contracts.FindGenreByNameResponseBody,
  Static<typeof findGenreByNameResponseBodyDtoSchema>
>;
