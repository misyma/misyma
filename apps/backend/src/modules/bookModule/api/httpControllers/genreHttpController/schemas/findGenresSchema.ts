import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { genreDTOSchema } from './genreDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findGenresResponseBodyDTOSchema = Type.Object({
  data: Type.Array(genreDTOSchema),
});

export type FindGenresResponseBodyDTO = TypeExtends<
  Static<typeof findGenresResponseBodyDTOSchema>,
  contracts.FindGenresResponseBody
>;
