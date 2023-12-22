import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { authorDTOSchema } from './authorSchema.js';
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
  authors: Type.Array(authorDTOSchema),
});

export type FindBookResponseBodyDTO = TypeExtends<
  Static<typeof findBookResponseBodyDTOSchema>,
  contracts.FindBookPathParams
>;
