import {
  type UpdateGenrePathParams,
  type UpdateGenreRequestBody,
  type UpdateGenreResponseBody,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDtoSchema, genreNameSchema } from '../../common/genreDto.js';

export const updateGenrePathParamsDtoSchema = Type.Object({
  genreId: Type.String({ format: 'uuid' }),
});

export type UpdateGenrePathParamsDto = TypeExtends<
  UpdateGenrePathParams,
  Static<typeof updateGenrePathParamsDtoSchema>
>;

export const updateGenreBodyDtoSchema = Type.Object({
  name: genreNameSchema,
});

export type UpdateGenreBodyDto = TypeExtends<UpdateGenreRequestBody, Static<typeof updateGenreBodyDtoSchema>>;

export const updateGenreResponseBodyDtoSchema = genreDtoSchema;

export type UpdateGenreResponseBodyDto = TypeExtends<
  UpdateGenreResponseBody,
  Static<typeof updateGenreResponseBodyDtoSchema>
>;
