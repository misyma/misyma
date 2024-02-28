import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteGenrePathParamsDTOSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
  }),
});

export type DeleteGenrePathParamsDTO = TypeExtends<
  contracts.DeleteGenrePathParams,
  Static<typeof deleteGenrePathParamsDTOSchema>
>;

export const deleteGenreResponseBodyDTOSchema = Type.Null();

export type DeleteGenreResponseBodyDTO = Static<typeof deleteGenreResponseBodyDTOSchema>;
