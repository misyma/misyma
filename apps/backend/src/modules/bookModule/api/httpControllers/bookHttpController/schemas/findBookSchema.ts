import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { bookDTOSchema } from '../../common/bookDto.js';

export const findBookPathParamsDTOSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type FindBookPathParamsDTO = TypeExtends<
  Static<typeof findBookPathParamsDTOSchema>,
  contracts.FindBookPathParams
>;

export const findBookResponseBodyDTOSchema = bookDTOSchema;

export type FindBookResponseBodyDTO = TypeExtends<
  Static<typeof findBookResponseBodyDTOSchema>,
  contracts.FindBookResponseBody
>;
