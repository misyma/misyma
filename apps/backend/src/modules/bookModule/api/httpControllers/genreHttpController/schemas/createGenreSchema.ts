import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { genreDTO } from './dtos/genreDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const createGenreBodyDTOSchema = Type.Object({
  name: Type.String({
    minLength: 2,
  }),
});

export type CreateGenreBodyDTO = TypeExtends<contracts.CreateGenreBody, Static<typeof createGenreBodyDTOSchema>>;

export const createGenreCreatedResponseDTOSchema = Type.Object({
  genre: genreDTO,
});

export type CreateGenreCreatedResponseDTO = TypeExtends<
  contracts.CreateGenreResponse,
  Static<typeof createGenreCreatedResponseDTOSchema>
>;
