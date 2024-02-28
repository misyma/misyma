import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { genreDTO } from './dtos/genreDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findGenreByNameQueryParamsDTOSchema = Type.Object({
  name: Type.String({
    minLength: 2,
  }),
});

export type FindGenreByNameQueryParamsDTO = TypeExtends<
  contracts.FindGenreByNameQueryParams,
  Static<typeof findGenreByNameQueryParamsDTOSchema>
>;

export const findGenreByNameResponseBodyDTOSchema = genreDTO;

export type FindGenreByNameResponseBodyDTO = TypeExtends<
  contracts.FindGenreByNameResponseBody,
  Static<typeof findGenreByNameResponseBodyDTOSchema>
>;
