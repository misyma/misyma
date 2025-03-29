import type * as contracts from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';

export const deleteCollectionPathParamsDtoSchema = Type.Object({
  collectionId: Type.String({ format: 'uuid' }),
});

export type DeleteCollectionPathParamsDto = TypeExtends<
  contracts.DeleteCollectionPathParams,
  Static<typeof deleteCollectionPathParamsDtoSchema>
>;

export const deleteCollectionResponseBodyDtoSchema = Type.Null();

export type DeleteCollectionResponseBodyDto = Static<typeof deleteCollectionResponseBodyDtoSchema>;
