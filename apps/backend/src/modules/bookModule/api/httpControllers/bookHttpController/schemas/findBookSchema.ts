import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const findBookPathParamsDTOSchema = Type.Object({
  id: Type.String(),
});

export type FindBookPathParamsDTO = TypeExtends<
  Static<typeof findBookPathParamsDTOSchema>,
  contracts.FindBookPathParams
>;

export const findBookResponseBodyDTOSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  releaseYear: Type.Integer(),
  authorId: Type.String(),
});

export type FindBookResponseBodyDTO = TypeExtends<
  Static<typeof findBookResponseBodyDTOSchema>,
  contracts.FindBookPathParams
>;
