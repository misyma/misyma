import { type Metadata } from '../metadata.js';

import { type Category } from './category.js';

export interface FindCategoriesQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindCategoriesResponseBody {
  readonly data: Category[];
  readonly metadata: Metadata;
}
