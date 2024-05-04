import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDtoSchema } from '../../common/genreDto.js';

export const createGenreBodyDtoSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type CreateGenreBodyDto = TypeExtends<contracts.CreateGenreRequestBody, Static<typeof createGenreBodyDtoSchema>>;

export const createGenreResponseBodyDtoSchema = genreDtoSchema;

export type CreateGenreResponseBodyDto = TypeExtends<
  contracts.CreateGenreResponseBody,
  Static<typeof createGenreResponseBodyDtoSchema>
>;
