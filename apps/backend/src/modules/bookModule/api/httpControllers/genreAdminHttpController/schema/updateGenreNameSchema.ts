import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDTOSchema } from '../../common/genreDto.js';

export const updateGenreNamePathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type UpdateGenreNamePathParamsDTO = TypeExtends<
  contracts.UpdateGenreNamePathParams,
  Static<typeof updateGenreNamePathParamsDTOSchema>
>;

export const updateGenreNameBodyDTOSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type UpdateGenreNameBodyDTO = TypeExtends<
  contracts.UpdateGenreNameRequestBody,
  Static<typeof updateGenreNameBodyDTOSchema>
>;

export const updateGenreNameResponseBodyDTOSchema = genreDTOSchema;

export type UpdateGenreNameResponseBodyDTO = TypeExtends<
  contracts.UpdateGenreNameResponseBody,
  Static<typeof updateGenreNameResponseBodyDTOSchema>
>;
