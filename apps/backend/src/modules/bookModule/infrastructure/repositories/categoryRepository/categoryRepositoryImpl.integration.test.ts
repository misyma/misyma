import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { Generator } from '../../../../../../tests/generator.js';
import { testSymbols } from '../../../../../../tests/symbols.js';
import { TestContainer } from '../../../../../../tests/testContainer.js';
import { RepositoryError } from '../../../../../common/errors/repositoryError.js';
import { type CategoryRawEntity } from '../../../../databaseModule/infrastructure/tables/categoriesTable/categoryRawEntity.js';
import { databaseSymbols } from '../../../../databaseModule/symbols.js';
import { type DatabaseClient } from '../../../../databaseModule/types/databaseClient.js';
import { Category } from '../../../domain/entities/category/category.js';
import { type CategoryRepository } from '../../../domain/repositories/categoryRepository/categoryRepository.js';
import { symbols } from '../../../symbols.js';
import { CategoryTestFactory } from '../../../tests/factories/categoryTestFactory/categoryTestFactory.js';
import { type CategoryTestUtils } from '../../../tests/utils/categoryTestUtils/categoryTestUtils.js';

describe('CategoryRepositoryImpl', () => {
  let categoryRepository: CategoryRepository;

  let databaseClient: DatabaseClient;

  let categoryTestUtils: CategoryTestUtils;

  const categoryTestFactory = new CategoryTestFactory();

  beforeEach(async () => {
    const container = await TestContainer.create();

    categoryRepository = container.get<CategoryRepository>(symbols.categoryRepository);

    databaseClient = container.get<DatabaseClient>(databaseSymbols.databaseClient);

    categoryTestUtils = container.get<CategoryTestUtils>(testSymbols.categoryTestUtils);

    await categoryTestUtils.truncate();
  });

  afterEach(async () => {
    await categoryTestUtils.truncate();

    await databaseClient.destroy();
  });

  describe('findById', () => {
    it('returns null - when Category was not found', async () => {
      const id = Generator.uuid();

      const res = await categoryRepository.findCategory({ id });

      expect(res).toBeNull();
    });

    it('returns Category', async () => {
      const createdCategory = await categoryTestUtils.createAndPersist();

      const category = await categoryRepository.findCategory({ id: createdCategory.id });

      expect(category).toBeInstanceOf(Category);

      expect(category?.getId()).toEqual(createdCategory.id);
    });
  });

  describe('findCategories', () => {
    it('returns an empty array - given no Categories found', async () => {
      const nonExistentIds = Array.from({ length: 5 }, () => Generator.uuid());

      const categories = await categoryRepository.findCategories({
        ids: nonExistentIds,
        page: 1,
        pageSize: 10,
      });

      expect(categories.length).toBe(0);
    });

    it('returns Categories by ids', async () => {
      const category1 = await categoryTestUtils.createAndPersist();

      const category2 = await categoryTestUtils.createAndPersist();

      const category3 = await categoryTestUtils.createAndPersist();

      const category4 = await categoryTestUtils.createAndPersist();

      const categories = await categoryRepository.findCategories({
        ids: [category1.id, category2.id, category3.id, category4.id],
        page: 1,
        pageSize: 10,
      });

      expect(categories.length).toBe(4);
    });

    it('returns all Categories', async () => {
      const createdCategories: CategoryRawEntity[] = [];

      for (let i = 0; i < 8; i++) {
        const createdCategory = await categoryTestUtils.createAndPersist();

        createdCategories.push(createdCategory);
      }

      const categories = await categoryRepository.findCategories({
        page: 1,
        pageSize: 10,
      });

      expect(categories.length).toBe(createdCategories.length);

      expect(categories).toBeInstanceOf(Array);
    });
  });

  describe('findByName', () => {
    it('returns null - when Category was not found', async () => {
      const category = await categoryRepository.findCategory({
        name: 'non-existing-name',
      });

      expect(category).toBeNull();
    });

    it('returns Category', async () => {
      const category = await categoryTestUtils.createAndPersist();

      const result = await categoryRepository.findCategory({
        name: category.name,
      });

      expect(result).toBeInstanceOf(Category);

      expect(result?.getName()).toEqual(category.name);
    });
  });

  describe('Save', () => {
    it('creates Category', async () => {
      const name = Generator.word();

      const category = await categoryRepository.saveCategory({
        category: {
          name,
        },
      });

      expect(category).toBeInstanceOf(Category);

      expect(category.getName()).toBe(name);

      const createdCategory = await categoryTestUtils.findById(category.getId());

      expect(createdCategory?.name).toBe(name);
    });

    it('throws an error while creating - when Category with the same name already exists', async () => {
      const name = Generator.word();

      await categoryRepository.saveCategory({
        category: {
          name,
        },
      });

      try {
        await categoryRepository.saveCategory({
          category: {
            name,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);

        expect((error as RepositoryError).context).toEqual({
          entity: 'Category',
          operation: 'create',
          originalError: expect.any(Error),
        });

        return;
      }

      expect.fail();
    });

    it('updates Category', async () => {
      const categoryRawEntity = await categoryTestUtils.createAndPersist();

      const newName = Generator.words(2);

      const category = categoryTestFactory.create(categoryRawEntity);

      category.setName({ name: newName });

      const upatedCategory = await categoryRepository.saveCategory({
        category,
      });

      expect(upatedCategory).toBeInstanceOf(Category);

      expect(upatedCategory.getName()).toBe(newName);

      const persistedCategory = await categoryTestUtils.findById(categoryRawEntity.id);

      expect(persistedCategory).not.toBeNull();

      expect(persistedCategory?.name).toBe(newName);
    });

    it('throws an error while updating - when Category with the same name already exists', async () => {
      const createdCategory1 = await categoryTestUtils.createAndPersist();

      const createdCategory2 = await categoryTestUtils.createAndPersist();

      try {
        await categoryRepository.saveCategory({
          category: new Category({
            id: createdCategory1.id,
            name: createdCategory2.name,
          }),
        });
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);

        expect((error as RepositoryError).context).toEqual({
          entity: 'Category',
          operation: 'update',
          originalError: expect.any(Error),
        });

        return;
      }

      expect.fail();
    });
  });

  describe('delete', () => {
    it('deletes Category', async () => {
      const createdCategory = await categoryTestUtils.createAndPersist();

      await categoryRepository.deleteCategory({ id: createdCategory.id });

      const deletedCategory = await categoryTestUtils.findById(createdCategory.id);

      expect(deletedCategory).toBeNull();
    });
  });
});
