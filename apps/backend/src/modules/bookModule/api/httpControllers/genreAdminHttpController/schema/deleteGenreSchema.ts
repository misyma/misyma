import type * as contracts from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteGenrePathParamsDtoSchema = Type.Object({
  genreId: Type.String({ format: 'uuid' }),
});

export type DeleteGenrePathParamsDto = TypeExtends<
  contracts.DeleteGenrePathParams,
  Static<typeof deleteGenrePathParamsDtoSchema>
>;

export const deleteGenreResponseBodyDtoSchema = Type.Null();

export type DeleteGenreResponseBodyDto = Static<typeof deleteGenreResponseBodyDtoSchema>;
