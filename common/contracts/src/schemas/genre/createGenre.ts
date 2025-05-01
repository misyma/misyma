import { type Category } from './category.js';

export interface CreateCategoryRequestBody {
  readonly name: string;
}

export type CreateCategoryResponseBody = Category;
