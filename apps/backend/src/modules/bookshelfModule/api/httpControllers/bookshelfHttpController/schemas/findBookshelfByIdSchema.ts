import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { bookshelfDtoSchema } from './bookshelfDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookshelfByIdPathParamsDtoSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type FindBookshelfByIdPathParamsDto = TypeExtends<
  Static<typeof findBookshelfByIdPathParamsDtoSchema>,
  contracts.FindBookshelfByIdParams
>;

export const findBookshelfByIdResponseBodyDtoSchema = bookshelfDtoSchema;

export type FindBookshelfByIdResponseBodyDto = TypeExtends<
  Static<typeof findBookshelfByIdResponseBodyDtoSchema>,
  contracts.FindBookshelfByIdResponseBody
>;
