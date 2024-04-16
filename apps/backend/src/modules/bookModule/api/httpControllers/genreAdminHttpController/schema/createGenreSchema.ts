import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDTOSchema } from '../../common/genreDto.js';

export const createGenreBodyDTOSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type CreateGenreBodyDTO = TypeExtends<contracts.CreateGenreRequestBody, Static<typeof createGenreBodyDTOSchema>>;

export const createGenreResponseBodyDTOSchema = genreDTOSchema;

export type CreateGenreResponseBodyDTO = TypeExtends<
  contracts.CreateGenreResponseBody,
  Static<typeof createGenreResponseBodyDTOSchema>
>;
