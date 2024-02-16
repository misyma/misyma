import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDTO } from '../../genreHttpController/schemas/dtos/genreDTO.js';

export const updateGenreNamePathParamsDTOSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
  }),
});

export type UpdateGenreNamePathParamsDTO = TypeExtends<
  contracts.UpdateGenreNamePathParams,
  Static<typeof updateGenreNamePathParamsDTOSchema>
>;

export const updateGenreNameBodyDTOSchema = Type.Object({
  name: Type.String({
    minLength: 2,
  }),
});

export type UpdateGenreNameBodyDTO = TypeExtends<
  contracts.UpdateGenreNameBody,
  Static<typeof updateGenreNameBodyDTOSchema>
>;

export const updateGenreNameOkResponseBodyDTOSchema = genreDTO;

export type UpdateGenreNameOkResponseBodyDTO = TypeExtends<
  contracts.UpdateGenreNameResponse,
  Static<typeof updateGenreNameOkResponseBodyDTOSchema>
>;
