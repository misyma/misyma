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
        userId: collectionEntity.userId,
        createdAt: collectionEntity.createdAt,
      },
    });
  });

  it('maps from domain collection to collection raw entity', () => {
    const collection = collectionTestFactory.create();

    const collectionRawEntity = collectionMapperImpl.mapToPersistence(collection);

    expect(collectionRawEntity).toEqual({
      id: collection.getId(),
      name: collection.getName(),
      userId: collection.getUserId(),
      createdAt: collection.getCreatedAt(),
    });
  });
});
