import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDTOSchema } from '../../common/genreDto.js';

export const findGenreByIdPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type FindGenreByIdPathParamsDTO = TypeExtends<
  contracts.FindGenreByIdPathParams,
  Static<typeof findGenreByIdPathParamsDTOSchema>
>;

export const findGenreByIdResponseBodyDTOSchema = genreDTOSchema;

export type FindGenreByIdResponseBodyDTO = TypeExtends<
  contracts.FindGenreByIdResponseBody,
  Static<typeof findGenreByIdResponseBodyDTOSchema>
>;
