import { beforeEach, expect, describe, it } from 'vitest';

import { CategoryTestFactory } from '../../../../tests/factories/categoryTestFactory/categoryTestFactory.js';

import { CategoryMapperImpl } from './categoryMapperImpl.js';

describe('CategoryMapperImpl', () => {
  let categoryMapperImpl: CategoryMapperImpl;

  const categoryTestFactory = new CategoryTestFactory();

  beforeEach(async () => {
    categoryMapperImpl = new CategoryMapperImpl();
  });

  it('maps from category raw entity to domain category', async () => {
    const categoryEntity = categoryTestFactory.createRaw();

    const category = categoryMapperImpl.mapToDomain(categoryEntity);

    expect(category).toEqual({
      id: categoryEntity.id,
      state: {
        name: categoryEntity.name,
      },
    });
  });

  it('maps from domain category to category raw entity', () => {
    const category = categoryTestFactory.create();

    const categoryRawEntity = categoryMapperImpl.mapToPersistence(category);

    expect(categoryRawEntity).toEqual({
      id: category.getId(),
      name: category.getName(),
    });
  });
});
