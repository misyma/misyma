import type * as contracts from '@common/contracts';
import { Type, type Static } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteAuthorPathParamsDtoSchema = Type.Object({
  authorId: Type.String({ format: 'uuid' }),
});

export type DeleteAuthorPathParamsDto = TypeExtends<
  Static<typeof deleteAuthorPathParamsDtoSchema>,
  contracts.DeleteAuthorPathParams
>;

export const deleteAuthorResponseBodyDtoSchema = Type.Null();

export type DeleteAuthorResponseBodyDto = Static<typeof deleteAuthorResponseBodyDtoSchema>;
