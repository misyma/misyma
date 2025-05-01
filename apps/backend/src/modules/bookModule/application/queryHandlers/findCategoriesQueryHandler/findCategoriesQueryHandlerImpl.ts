import { type CategoryRepository } from '../../../domain/repositories/categoryRepository/categoryRepository.js';

import {
  type FindCategoriesResult,
  type FindCategoriesQueryHandler,
  type FindCategoriesPayload,
} from './findCategoriesQueryHandler.js';

export class FindCategoriesQueryHandlerImpl implements FindCategoriesQueryHandler {
  public constructor(private readonly categoryRepository: CategoryRepository) {}

  public async execute(payload: FindCategoriesPayload): Promise<FindCategoriesResult> {
    const { page, pageSize } = payload;

    const findCategoriesPayload = {
      page,
      pageSize,
    };

    const [categories, total] = await Promise.all([
      this.categoryRepository.findCategories(findCategoriesPayload),
      this.categoryRepository.countCategories(findCategoriesPayload),
    ]);

    return {
      categories,
      total,
    };
  }
}
