import { type Static, Type } from '@sinclair/typebox';

import type * as contracts from '@common/contracts';

import { type TypeExtends } from '../../../../../../common/types/schemaExtends.js';
import { collectionDtoSchema } from '../../common/collectionDto.js';

export const createCollectionBodyDtoSchema = Type.Object({
  name: Type.String({
    minLength: 1,
    maxLength: 64,
  }),
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
