import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDTOSchema } from './bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookshelfByIdPathParamsDTOSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type FindBookshelfByIdPathParamsDTO = TypeExtends<
  Static<typeof findBookshelfByIdPathParamsDTOSchema>,
  contracts.FindBookshelfByIdParams
>;

export const findBookshelfByIdResponseBodyDTOSchema = bookshelfDTOSchema;

export type FindBookshelfByIdResponseBodyDTO = TypeExtends<
  Static<typeof findBookshelfByIdResponseBodyDTOSchema>,
  contracts.FindBookshelfByIdResponseBody
>;
