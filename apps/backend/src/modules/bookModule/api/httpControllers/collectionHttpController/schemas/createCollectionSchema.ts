import type * as contracts from '@common/contracts';
import { type Static, Type } from '@sinclair/typebox';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { collectionDtoSchema, collectionNameSchema } from '../../common/collectionDto.js';

export const createCollectionBodyDtoSchema = Type.Object({
  name: collectionNameSchema,
  userId: Type.String({ format: 'uuid' }),
});

export type CreateCollectionBodyDto = TypeExtends<
  contracts.CreateCollectionRequestBody,
  Static<typeof createCollectionBodyDtoSchema>
>;

export const createCollectionResponseBodyDtoSchema = collectionDtoSchema;

export type CreateCollectionResponseBodyDto = TypeExtends<
  contracts.CreateCollectionResponseBody,
  Static<typeof createCollectionResponseBodyDtoSchema>
>;
