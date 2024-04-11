import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Author } from '../../../domain/entities/author/author.js';

export interface CreateAuthorCommandHandlerPayload {
  readonly name: string;
  readonly isApproved: boolean;
}

export interface CreateAuthorCommandHandlerResult {
  readonly author: Author;
}

export type CreateAuthorCommandHandler = CommandHandler<
  CreateAuthorCommandHandlerPayload,
  CreateAuthorCommandHandlerResult
>;
