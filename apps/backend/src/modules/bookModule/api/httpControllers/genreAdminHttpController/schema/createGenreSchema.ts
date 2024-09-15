import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDtoSchema, genreNameSchema } from '../../common/genreDto.js';

export const createGenreBodyDtoSchema = Type.Object({
  name: genreNameSchema,
});

export type CreateGenreBodyDto = TypeExtends<contracts.CreateGenreRequestBody, Static<typeof createGenreBodyDtoSchema>>;

export const createGenreResponseBodyDtoSchema = genreDtoSchema;

export type CreateGenreResponseBodyDto = TypeExtends<
  contracts.CreateGenreResponseBody,
  Static<typeof createGenreResponseBodyDtoSchema>
>;
