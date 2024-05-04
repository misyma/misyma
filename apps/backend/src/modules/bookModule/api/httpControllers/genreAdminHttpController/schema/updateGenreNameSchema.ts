import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDtoSchema } from '../../common/genreDto.js';

export const updateGenreNamePathParamsDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type UpdateGenreNamePathParamsDto = TypeExtends<
  contracts.UpdateGenreNamePathParams,
  Static<typeof updateGenreNamePathParamsDtoSchema>
>;

export const updateGenreNameBodyDtoSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type UpdateGenreNameBodyDto = TypeExtends<
  contracts.UpdateGenreNameRequestBody,
  Static<typeof updateGenreNameBodyDtoSchema>
>;

export const updateGenreNameResponseBodyDtoSchema = genreDtoSchema;

export type UpdateGenreNameResponseBodyDto = TypeExtends<
  contracts.UpdateGenreNameResponseBody,
  Static<typeof updateGenreNameResponseBodyDtoSchema>
>;
