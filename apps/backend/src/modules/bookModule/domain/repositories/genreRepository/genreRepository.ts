import { type CategoryState, type Category } from '../../entities/category/category.js';

export interface FindCategoryPayload {
  readonly id?: string;
  readonly name?: string;
}

export interface SaveCategoryPayload {
  readonly category: CategoryState | Category;
}

export interface FindCategories {
  readonly ids?: string[];
  readonly page: number;
  readonly pageSize: number;
}

export interface DeleteCategoryPayload {
  readonly id: string;
}

export interface CategoryRepository {
  findCategory(payload: FindCategoryPayload): Promise<Category | null>;
  findCategories(payload: FindCategories): Promise<Category[]>;
  countCategories(payload: FindCategories): Promise<number>;
  saveCategory(payload: SaveCategoryPayload): Promise<Category>;
  deleteCategory(payload: DeleteCategoryPayload): Promise<void>;
}
