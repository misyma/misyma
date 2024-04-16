import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { genreDTOSchema } from '../../common/genreDto.js';

export const findGenresResponseBodyDTOSchema = Type.Object({
  data: Type.Array(genreDTOSchema),
});

export type FindGenresResponseBodyDTO = TypeExtends<
  Static<typeof findGenresResponseBodyDTOSchema>,
  contracts.FindGenresResponseBody
>;
