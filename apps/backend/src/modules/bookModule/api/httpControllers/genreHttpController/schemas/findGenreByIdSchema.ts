import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { genreDTO } from './dtos/genreDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findGenreByIdPathParamsDTOSchema = Type.Object({
  id: Type.String({
    format: 'uuid',
  }),
});

export type FindGenreByIdPathParamsDTO = TypeExtends<
  contracts.FindGenreByIdPathParams,
  Static<typeof findGenreByIdPathParamsDTOSchema>
>;

export const findGenreByIdOkResponseDTOSchema = genreDTO;

export type FindGenreByIdOkResponseDTO = TypeExtends<
  contracts.FindGenreByIdResponse,
  Static<typeof findGenreByIdOkResponseDTOSchema>
>;
