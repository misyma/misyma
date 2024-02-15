import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { genreDTO } from './dtos/genreDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findGenresOkResponseDTOSchema = Type.Object({
  genres: Type.Array(genreDTO),
});

export type FindGenresOkResponseDTO = TypeExtends<
  Static<typeof findGenresOkResponseDTOSchema>,
  contracts.FindGenresResponse
>;
