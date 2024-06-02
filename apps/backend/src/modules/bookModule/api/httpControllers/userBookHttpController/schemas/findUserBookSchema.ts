import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { userBookDtoSchema } from './userBookDto.js';
import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findUserBookPathParamsDtoSchema = Type.Object({
  userBookId: Type.String({ format: 'uuid' }),
});

export type FindUserBookPathParamsDto = TypeExtends<
  Static<typeof findUserBookPathParamsDtoSchema>,
  contracts.FindUserBookPathParams
>;

export const findUserBookResponseBodyDtoSchema = userBookDtoSchema;

export type FindUserBookResponseBodyDto = TypeExtends<
  Static<typeof findUserBookResponseBodyDtoSchema>,
  contracts.FindUserBookResponseBody
>;
