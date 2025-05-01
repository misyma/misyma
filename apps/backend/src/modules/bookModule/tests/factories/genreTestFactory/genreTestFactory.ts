import { Generator } from '../../../../../../tests/generator.js';
import { type CategoryRawEntity } from '../../../../databaseModule/infrastructure/tables/categoriesTable/categoryRawEntity.js';
import { Category, type CategoryState } from '../../../domain/entities/category/category.js';

export class CategoryTestFactory {
  public createRaw(overrides: Partial<CategoryRawEntity> = {}): CategoryRawEntity {
    return {
      id: Generator.uuid(),
      name: Generator.category().toLowerCase() + Generator.numericString(3),
      ...overrides,
    };
  }

  public create(overrides: Partial<CategoryState> = {}): Category {
    return new Category({
      id: Generator.uuid(),
      name: Generator.category().toLowerCase() + Generator.numericString(3),
      ...overrides,
    });
  }
}
