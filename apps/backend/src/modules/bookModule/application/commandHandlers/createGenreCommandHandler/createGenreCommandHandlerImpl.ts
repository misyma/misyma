import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type CategoryRepository } from '../../../domain/repositories/categoryRepository/categoryRepository.js';

import {
  type CreateCategoryCommandHandler,
  type CreateCategoryPayload,
  type CreateCategoryResult,
} from './createCategoryCommandHandler.js';

export class CreateCategoryCommandHandlerImpl implements CreateCategoryCommandHandler {
  public constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateCategoryPayload): Promise<CreateCategoryResult> {
    const { name } = payload;

    const normalizedName = name.toLowerCase();

    this.loggerService.debug({
      message: 'Creating Category...',
      name,
    });

    const categoryExists = await this.categoryRepository.findCategory({
      name: normalizedName,
    });

    if (categoryExists) {
      throw new ResourceAlreadyExistsError({
        resource: 'Category',
        name: normalizedName,
      });
    }

    const category = await this.categoryRepository.saveCategory({
      category: {
        name: normalizedName,
      },
    });

    this.loggerService.debug({
      message: 'Category created.',
      id: category.getId(),
      name: normalizedName,
    });

    return { category };
  }
}
