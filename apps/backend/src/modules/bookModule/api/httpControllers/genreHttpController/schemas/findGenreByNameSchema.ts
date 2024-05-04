import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDtoSchema } from '../../common/genreDto.js';

export const findGenreByNameQueryParamsDtoSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type FindGenreByNameQueryParamsDto = TypeExtends<
  contracts.FindGenreByNameQueryParams,
  Static<typeof findGenreByNameQueryParamsDtoSchema>
>;

export const findGenreByNameResponseBodyDtoSchema = genreDtoSchema;

export type FindGenreByNameResponseBodyDto = TypeExtends<
  contracts.FindGenreByNameResponseBody,
  Static<typeof findGenreByNameResponseBodyDtoSchema>
>;
