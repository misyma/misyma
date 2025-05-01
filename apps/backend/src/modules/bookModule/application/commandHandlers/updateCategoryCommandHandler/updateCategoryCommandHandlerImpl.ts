import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
import { ResourceAlreadyExistsError } from '../../../../../common/errors/resourceAlreadyExistsError.js';
import { type LoggerService } from '../../../../../libs/logger/loggerService.js';
import { type CategoryRepository } from '../../../domain/repositories/categoryRepository/categoryRepository.js';

import {
  type UpdateCategoryCommandHandler,
  type UpdateCategoryPayload,
  type UpdateCategoryResult,
} from './updateCategoryCommandHandler.js';

export class UpdateCategoryCommandHandlerImpl implements UpdateCategoryCommandHandler {
  public constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: UpdateCategoryPayload): Promise<UpdateCategoryResult> {
    const { id, name } = payload;

    const normalizedName = name.toLowerCase();

    this.loggerService.debug({
      message: 'Updating Category...',
      id,
      name: normalizedName,
    });

    const existingCategory = await this.categoryRepository.findCategory({ id });

    if (!existingCategory) {
      throw new OperationNotValidError({
        reason: 'Category does not exist.',
        id,
      });
    }

    const nameTaken = await this.categoryRepository.findCategory({
      name: normalizedName,
    });

    if (nameTaken) {
      throw new ResourceAlreadyExistsError({
        resource: 'Category',
        name,
      });
    }

    existingCategory.setName({ name: normalizedName });

    const category = await this.categoryRepository.saveCategory({
      category: existingCategory,
    });

    this.loggerService.debug({
      message: 'Category updated.',
      id,
      name: normalizedName,
    });

    return {
      category,
    };
  }
}
