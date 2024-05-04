import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDtoSchema } from '../../common/genreDto.js';

export const findGenreByIdPathParamsDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type FindGenreByIdPathParamsDto = TypeExtends<
  contracts.FindGenreByIdPathParams,
  Static<typeof findGenreByIdPathParamsDtoSchema>
>;

export const findGenreByIdResponseBodyDtoSchema = genreDtoSchema;

export type FindGenreByIdResponseBodyDto = TypeExtends<
  contracts.FindGenreByIdResponseBody,
  Static<typeof findGenreByIdResponseBodyDtoSchema>
>;
