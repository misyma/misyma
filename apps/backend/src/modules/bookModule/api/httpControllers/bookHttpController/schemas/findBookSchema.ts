import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDtoSchema } from '../../common/bookDto.js';

export const findBookPathParamsDtoSchema = Type.Object({
  bookId: Type.String({ format: 'uuid' }),
});

export type FindBookPathParamsDto = TypeExtends<
  Static<typeof findBookPathParamsDtoSchema>,
  contracts.FindBookPathParams
>;

export const findBookResponseBodyDtoSchema = bookDtoSchema;

export type FindBookResponseBodyDto = TypeExtends<
  Static<typeof findBookResponseBodyDtoSchema>,
  contracts.FindBookResponseBody
>;
