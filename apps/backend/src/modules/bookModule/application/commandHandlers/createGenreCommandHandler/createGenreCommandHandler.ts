import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Category } from '../../../domain/entities/category/category.js';

export interface CreateCategoryPayload {
  name: string;
}

export interface CreateCategoryResult {
  category: Category;
}

export type CreateCategoryCommandHandler = CommandHandler<CreateCategoryPayload, CreateCategoryResult>;
