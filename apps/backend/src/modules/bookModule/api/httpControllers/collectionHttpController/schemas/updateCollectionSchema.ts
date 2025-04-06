import {
  type UpdateCollectionPathParams,
  type UpdateCollectionRequestBody,
  type UpdateCollectionResponseBody,
} from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { collectionDtoSchema, collectionNameSchema } from '../../common/collectionDto.js';

export const updateCollectionPathParamsDtoSchema = Type.Object({
  collectionId: Type.String({ format: 'uuid' }),
});

export type UpdateCollectionPathParamsDto = TypeExtends<
  UpdateCollectionPathParams,
  Static<typeof updateCollectionPathParamsDtoSchema>
>;

export const updateCollectionBodyDtoSchema = Type.Object({
  name: collectionNameSchema,
});

export type UpdateCollectionBodyDto = TypeExtends<
  UpdateCollectionRequestBody,
  Static<typeof updateCollectionBodyDtoSchema>
>;

export const updateCollectionResponseBodyDtoSchema = collectionDtoSchema;

export type UpdateCollectionResponseBodyDto = TypeExtends<
  UpdateCollectionResponseBody,
  Static<typeof updateCollectionResponseBodyDtoSchema>
>;
