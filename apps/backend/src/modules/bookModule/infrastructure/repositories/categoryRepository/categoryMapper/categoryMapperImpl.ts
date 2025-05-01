import { type CategoryRawEntity } from '../../../../../databaseModule/infrastructure/tables/categoriesTable/categoryRawEntity.js';
import { Category } from '../../../../domain/entities/category/category.js';

import { type CategoryMapper } from './categoryMapper.js';

export class CategoryMapperImpl implements CategoryMapper {
  public mapToDomain(raw: CategoryRawEntity): Category {
    return new Category({
      id: raw.id,
      name: raw.name,
    });
  }

  public mapToPersistence(domain: Category): CategoryRawEntity {
    return {
      id: domain.getId(),
      name: domain.getName(),
    };
  }
}
