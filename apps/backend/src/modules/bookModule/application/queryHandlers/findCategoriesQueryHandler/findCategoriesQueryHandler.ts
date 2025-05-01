import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Category } from '../../../domain/entities/category/category.js';

export interface FindCategoriesPayload {
  readonly page: number;
  readonly pageSize: number;
}

export interface FindCategoriesResult {
  readonly categories: Category[];
  readonly total: number;
}

export type FindCategoriesQueryHandler = QueryHandler<FindCategoriesPayload, FindCategoriesResult>;
