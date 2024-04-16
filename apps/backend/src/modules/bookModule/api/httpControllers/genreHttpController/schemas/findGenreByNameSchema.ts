import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { genreDTOSchema } from '../../common/genreDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findGenreByNameQueryParamsDTOSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type FindGenreByNameQueryParamsDTO = TypeExtends<
  contracts.FindGenreByNameQueryParams,
  Static<typeof findGenreByNameQueryParamsDTOSchema>
>;

export const findGenreByNameResponseBodyDTOSchema = genreDTOSchema;

export type FindGenreByNameResponseBodyDTO = TypeExtends<
  contracts.FindGenreByNameResponseBody,
  Static<typeof findGenreByNameResponseBodyDTOSchema>
>;
