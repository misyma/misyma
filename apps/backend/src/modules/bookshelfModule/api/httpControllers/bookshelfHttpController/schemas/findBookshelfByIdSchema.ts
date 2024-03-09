import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDTOSchema } from './dtos/bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookshelfByIdPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type FindBookshelfByIdPathParamsDTO = TypeExtends<
  Static<typeof findBookshelfByIdPathParamsDTOSchema>,
  contracts.FindBookshelfByIdParams
>;

export const findBookshelfByIdResponseBodyDTOSchema = Type.Object({
  bookshelf: bookshelfDTOSchema,
});

export type FindBookshelfByIdResponseBodyDTO = TypeExtends<
  Static<typeof findBookshelfByIdResponseBodyDTOSchema>,
  contracts.FindBookshelfByIdResponseBody
>;
