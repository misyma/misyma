import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookDTOSchema } from './bookDTO.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBooksByBookshelfIdPathParamsDTOSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type FindBooksByBookshelfIdPathParamsDTO = TypeExtends<
  contracts.FindBooksByBookshelfIdPathParams,
  Static<typeof findBooksByBookshelfIdPathParamsDTOSchema>
>;

export const findBooksByBookshelfIdResponseBodyDTOSchema = Type.Object({
  data: Type.Array(bookDTOSchema),
});

export type FindBooksByBookshelfIdResponseBodyDTO = TypeExtends<
  contracts.FindBooksByBookshelfIdResponseBody,
  Static<typeof findBooksByBookshelfIdResponseBodyDTOSchema>
>;
