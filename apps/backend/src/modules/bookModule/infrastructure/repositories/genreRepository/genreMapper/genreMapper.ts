import { type CategoryRawEntity } from '../../../../../databaseModule/infrastructure/tables/categoriesTable/categoryRawEntity.js';
import { type Category } from '../../../../domain/entities/category/category.js';

export interface CategoryMapper {
  mapToDomain(raw: CategoryRawEntity): Category;
  mapToPersistence(domain: Category): CategoryRawEntity;
}
