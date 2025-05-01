import { ResourceNotFoundError } from '../../../../../common/errors/resourceNotFoundError.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type CategoryRepository } from '../../../domain/repositories/categoryRepository/categoryRepository.js';

import { type DeleteCategoryCommandHandler, type DeleteCategoryPayload } from './deleteCategoryCommandHandler.js';

export class DeleteCategoryCommandHandlerImpl implements DeleteCategoryCommandHandler {
  public constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteCategoryPayload): Promise<void> {
    const { id } = payload;

    this.loggerService.debug({
      message: 'Deleting Category...',
      id,
    });

    const category = await this.categoryRepository.findCategory({
      id,
    });

    if (!category) {
      throw new ResourceNotFoundError({
        resource: 'Category',
        id,
      });
    }

    await this.categoryRepository.deleteCategory({ id: category.getId() });

    this.loggerService.debug({
      message: 'Category deleted.',
      id,
    });
  }
}
