import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDTOSchema } from './dtos/bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookshelvesByUserIdPathParamsDTOSchema = Type.Object({
  userId: Type.String({ format: 'uuid' }),
});

export type FindBookshelvesByUserIdPathParamsDTO = TypeExtends<
  Static<typeof findBookshelvesByUserIdPathParamsDTOSchema>,
  contracts.FindBookshelvesByUserIdParams
>;

export const findBookshelvesByUserIdResponseBodyDTOSchema = Type.Object({
  data: Type.Array(bookshelfDTOSchema),
});

export type FindBookshelvesByUserIdResponseBodyDTO = TypeExtends<
  Static<typeof findBookshelvesByUserIdResponseBodyDTOSchema>,
  contracts.FindBookshelvesByUserIdResponseBody
>;
