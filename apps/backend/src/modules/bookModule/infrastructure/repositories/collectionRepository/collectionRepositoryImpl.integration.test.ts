import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { type TestUtils } from '../../../../../../tests/testUtils.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type UserTestUtils } from '../../../../userModule/tests/utils/userTestUtils/userTestUtils.js';
import { Collection } from '../../../domain/entities/collection/collection.js';
import { type CollectionRepository } from '../../../domain/repositories/collectionRepository/collectionRepository.js';
import { symbols } from '../../../symbols.js';
import { CollectionTestFactory } from '../../../tests/factories/collectionTestFactory/collectionTestFactory.js';
import { type CollectionTestUtils } from '../../../tests/utils/collectionTestUtils/collectionTestUtils.js';
import { type CollectionRawEntity } from '../../databases/bookDatabase/tables/collectionTable/collectionRawEntity.js';

describe('CollectionRepositoryImpl', () => {
  let collectionRepository: CollectionRepository;

  let collectionTestUtils: CollectionTestUtils;

  let userTestUtils: UserTestUtils;

  const collectionTestFactory = new CollectionTestFactory();

  let testUtils: TestUtils[];

  beforeEach(async () => {
    const container = TestContainer.create();

    collectionRepository = container.get<CollectionRepository>(symbols.collectionRepository);

    collectionTestUtils = container.get<CollectionTestUtils>(testSymbols.collectionTestUtils);

    userTestUtils = container.get<UserTestUtils>(testSymbols.userTestUtils);

    testUtils = [collectionTestUtils, userTestUtils];

    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  afterEach(async () => {
    for (const testUtil of testUtils) {
      await testUtil.truncate();
    }
  });

  describe('findById', () => {
    it('returns null - when Collection was not found', async () => {
      const res = await collectionRepository.findCollection({ id: 'non-existing-id' });

      expect(res).toBeNull();
    });

    it('returns Collection', async () => {
      const user = await userTestUtils.createAndPersist();

      const createdCollection = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

      const collection = await collectionRepository.findCollection({ id: createdCollection.id });

      expect(collection).toBeInstanceOf(Collection);

      expect(collection?.getId()).toEqual(createdCollection.id);
    });
  });

  describe('findCollections', () => {
    it('returns an empty array - given no Collections found', async () => {
      const nonExistentIds = Array.from({ length: 5 }, () => Generator.uuid());

      const collections = await collectionRepository.findCollections({
        ids: nonExistentIds,
        page: 1,
        pageSize: 10,
      });

      expect(collections.length).toBe(0);
    });

    it('returns Collections by ids', async () => {
      const user = await userTestUtils.createAndPersist();

      const collection1 = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

      const collection2 = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

      const collection3 = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

      const collection4 = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

      const collections = await collectionRepository.findCollections({
        ids: [collection1.id, collection2.id, collection3.id, collection4.id],
        page: 1,
        pageSize: 10,
      });

      expect(collections.length).toBe(4);
    });

    it('returns all Collections', async () => {
      const user = await userTestUtils.createAndPersist();

      const createdCollections: CollectionRawEntity[] = [];

      for (let i = 0; i < 8; i++) {
        const createdCollection = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

        createdCollections.push(createdCollection);
      }

      const collections = await collectionRepository.findCollections({
        page: 1,
        pageSize: 10,
      });

      expect(collections.length).toBe(createdCollections.length);

      expect(collections).toBeInstanceOf(Array);
    });
  });

  describe('findByName', () => {
    it('returns null - when Collection was not found', async () => {
      const collection = await collectionRepository.findCollection({
        name: 'non-existing-name',
        userId: Generator.uuid(),
      });

      expect(collection).toBeNull();
    });

    it('returns Collection', async () => {
      const user = await userTestUtils.createAndPersist();

      const collection = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

      const result = await collectionRepository.findCollection({
        name: collection.name,
        userId: collection.userId,
      });

      expect(result).toBeInstanceOf(Collection);

      expect(result?.getName()).toEqual(collection.name);

      expect(result?.getUserId()).toEqual(collection.userId);
    });
  });

  describe('Save', () => {
    it('creates Collection', async () => {
      const user = await userTestUtils.createAndPersist();

      const name = Generator.word();

      const collection = await collectionRepository.saveCollection({
        collection: {
          name,
          userId: user.id,
        },
      });

      expect(collection).toBeInstanceOf(Collection);

      expect(collection.getName()).toBe(name);

      const createdCollection = await collectionTestUtils.findById(collection.getId());

      expect(createdCollection?.name).toBe(name);

      expect(createdCollection?.userId).toBe(user.id);
    });

    it('throws an error while creating - when Collection with the same name already exists', async () => {
      const user = await userTestUtils.createAndPersist();

      const name = Generator.word();

      await collectionRepository.saveCollection({
        collection: {
          name,
          userId: user.id,
        },
      });

      await expect(
        async () =>
          await collectionRepository.saveCollection({
            collection: {
              name,
              userId: user.id,
            },
          }),
      ).toThrowErrorInstance({
        instance: RepositoryError,
        context: {
          entity: 'Collection',
          operation: 'create',
        },
      });
    });

    it('updates Collection', async () => {
      const user = await userTestUtils.createAndPersist();

      const collectionRawEntity = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

      const newName = Generator.words(2);

      const collection = collectionTestFactory.create(collectionRawEntity);

      collection.setName({ name: newName });

      const upatedCollection = await collectionRepository.saveCollection({
        collection,
      });

      expect(upatedCollection).toBeInstanceOf(Collection);

      expect(upatedCollection.getName()).toBe(newName);

      const persistedCollection = await collectionTestUtils.findById(collectionRawEntity.id);

      expect(persistedCollection).not.toBeNull();

      expect(persistedCollection?.name).toBe(newName);
    });

    it('throws an error while updating - when Collection with the same name already exists', async () => {
      const user = await userTestUtils.createAndPersist();

      const createdCollection1 = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

      const createdCollection2 = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

      await expect(
        async () =>
          await collectionRepository.saveCollection({
            collection: new Collection({
              id: createdCollection1.id,
              name: createdCollection2.name,
              userId: user.id,
            }),
          }),
      ).toThrowErrorInstance({
        instance: RepositoryError,
        context: {
          entity: 'Collection',
          operation: 'update',
        },
      });
    });
  });

  describe('delete', () => {
    it('deletes Collection', async () => {
      const user = await userTestUtils.createAndPersist();

      const createdCollection = await collectionTestUtils.createAndPersist({ input: { userId: user.id } });

      await collectionRepository.deleteCollection({ id: createdCollection.id });

      const deletedCollection = await collectionTestUtils.findById(createdCollection.id);

      expect(deletedCollection).toBeNull();
    });
  });
});
