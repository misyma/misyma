import { type Category } from '../../../../domain/entities/category/category.js';
import { type CategoryDto } from '../categoryDto.js';

export function mapCategoryToDto(category: Category): CategoryDto {
  return {
    id: category.getId(),
    name: category.getName(),
  };
}
