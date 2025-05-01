import { type Category } from './category.js';

export interface UpdateCategoryPathParams {
  readonly categoryId: string;
}

export interface UpdateCategoryRequestBody {
  readonly name: string;
}

export type UpdateCategoryResponseBody = Category;
