import { type CreateGenreRequestBody, type CreateGenreResponseBody } from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDtoSchema, genreNameSchema } from '../../common/genreDto.js';

export const createGenreBodyDtoSchema = Type.Object({
  name: genreNameSchema,
});

export type CreateGenreBodyDto = TypeExtends<CreateGenreRequestBody, Static<typeof createGenreBodyDtoSchema>>;

export const createGenreResponseBodyDtoSchema = genreDtoSchema;

export type CreateGenreResponseBodyDto = TypeExtends<
  CreateGenreResponseBody,
  Static<typeof createGenreResponseBodyDtoSchema>
>;
