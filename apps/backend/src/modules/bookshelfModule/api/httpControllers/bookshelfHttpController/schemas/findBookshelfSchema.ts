import type * as contracts from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

import { bookshelfDtoSchema } from './bookshelfDto.js';

export const findBookshelfPathParamsDtoSchema = Type.Object({
  bookshelfId: Type.String({ format: 'uuid' }),
});

export type FindBookshelfPathParamsDto = TypeExtends<
  Static<typeof findBookshelfPathParamsDtoSchema>,
  contracts.FindBookshelfParams
>;

export const findBookshelfResponseBodyDtoSchema = bookshelfDtoSchema;

export type FindBookshelfResponseBodyDto = TypeExtends<
  Static<typeof findBookshelfResponseBodyDtoSchema>,
  contracts.FindBookshelfResponseBody
>;
