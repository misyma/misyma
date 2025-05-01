import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Category } from '../../../domain/entities/category/category.js';

export interface FindCategoriesPayload {
  readonly page: number;
  readonly pageSize: number;
}

export interface FindCategoriesriesResult {
  readonly categories: Category[];
  readonly total: number;
}

export type FindCategoriesriesQueryHandler = QueryHandler<CategoriestegoriesPayloCategoriesndCategoriesResult>;
