import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { genreDTO } from './dtos/genreDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findGenresResponseBodyDTOSchema = Type.Object({
  data: Type.Array(genreDTO),
});

export type FindGenresResponseBodyDTO = TypeExtends<
  Static<typeof findGenresResponseBodyDTOSchema>,
  contracts.FindGenresResponseBody
>;
