import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDTO } from '../../genreHttpController/schemas/dtos/genreDTO.js';

export const createGenreBodyDTOSchema = Type.Object({
  name: Type.String({
    minLength: 2,
  }),
});

export type CreateGenreBodyDTO = TypeExtends<contracts.CreateGenreRequestBody, Static<typeof createGenreBodyDTOSchema>>;

export const createGenreResponseBodyDTOSchema = genreDTO;

export type CreateGenreResponseBodyDTO = TypeExtends<
  contracts.CreateGenreResponseBody,
  Static<typeof createGenreResponseBodyDTOSchema>
>;
