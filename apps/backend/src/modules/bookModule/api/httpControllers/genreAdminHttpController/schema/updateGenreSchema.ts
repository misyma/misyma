import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDtoSchema, genreNameSchema } from '../../common/genreDto.js';

export const updateGenrePathParamsDtoSchema = Type.Object({
  genreId: Type.String({ format: 'uuid' }),
});

export type UpdateGenrePathParamsDto = TypeExtends<
  contracts.UpdateGenrePathParams,
  Static<typeof updateGenrePathParamsDtoSchema>
>;

export const updateGenreBodyDtoSchema = Type.Object({
  name: genreNameSchema,
});

export type UpdateGenreBodyDto = TypeExtends<contracts.UpdateGenreRequestBody, Static<typeof updateGenreBodyDtoSchema>>;

export const updateGenreResponseBodyDtoSchema = genreDtoSchema;

export type UpdateGenreResponseBodyDto = TypeExtends<
  contracts.UpdateGenreResponseBody,
  Static<typeof updateGenreResponseBodyDtoSchema>
>;
