import { beforeEach, expect, describe, it } from 'vitest';

import { CollectionTestFactory } from '../../../../tests/factories/collectionTestFactory/collectionTestFactory.js';

import { CollectionMapperImpl } from './collectionMapperImpl.js';

describe('CollectionMapperImpl', () => {
  let collectionMapperImpl: CollectionMapperImpl;

  const collectionTestFactory = new CollectionTestFactory();

  beforeEach(async () => {
    collectionMapperImpl = new CollectionMapperImpl();
  });

  it('maps from collection raw entity to domain collection', async () => {
    const collectionEntity = collectionTestFactory.createRaw();

    const collection = collectionMapperImpl.mapToDomain(collectionEntity);

    expect(collection).toEqual({
      id: collectionEntity.id,
      state: {
        name: collectionEntity.name,
        userId: collectionEntity.user_id,
        createdAt: collectionEntity.created_at,
      },
    });
  });
});
