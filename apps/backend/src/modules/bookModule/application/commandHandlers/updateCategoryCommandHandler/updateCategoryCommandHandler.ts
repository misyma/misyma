import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Category } from '../../../domain/entities/category/category.js';

export interface UpdateCategoryPayload {
  readonly id: string;
  readonly name: string;
}

export interface UpdateCategoryResult {
  readonly category: Category;
}

export type UpdateCategoryCommandHandler = CommandHandler<UpdateCategoryPayload, UpdateCategoryResult>;
