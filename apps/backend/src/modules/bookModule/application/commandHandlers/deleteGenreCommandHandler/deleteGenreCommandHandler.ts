import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface DeleteCategoryPayload {
  id: string;
}

export type DeleteCategoryCommandHandler = CommandHandler<DeleteCategoryPayload, void>;
