import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookDTOSchema } from './bookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBooksResponseBodyDTOSchema = Type.Object({
  data: Type.Array(bookDTOSchema),
});

export type FindBooksResponseBodyDTO = TypeExtends<
  contracts.FindBooksResponseBody,
  Static<typeof findBooksResponseBodyDTOSchema>
>;
