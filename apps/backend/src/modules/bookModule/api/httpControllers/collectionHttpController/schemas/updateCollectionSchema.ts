import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { collectionDtoSchema } from '../../common/collectionDto.js';

export const updateCollectionPathParamsDtoSchema = Type.Object({
  collectionId: Type.String({ format: 'uuid' }),
});

export type UpdateCollectionPathParamsDto = TypeExtends<
  contracts.UpdateCollectionPathParams,
  Static<typeof updateCollectionPathParamsDtoSchema>
>;

export const updateCollectionBodyDtoSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
});

export type UpdateCollectionBodyDto = TypeExtends<
  contracts.UpdateCollectionRequestBody,
  Static<typeof updateCollectionBodyDtoSchema>
>;

export const updateCollectionResponseBodyDtoSchema = collectionDtoSchema;

export type UpdateCollectionResponseBodyDto = TypeExtends<
  contracts.UpdateCollectionResponseBody,
  Static<typeof updateCollectionResponseBodyDtoSchema>
>;
