import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Author } from '../../../domain/entities/author/author.js';

export interface UpdateAuthorPayload {
  readonly id: string;
  readonly name?: string | undefined;
  readonly isApproved?: boolean | undefined;
}

export interface UpdateAuthorResult {
  readonly author: Author;
}

export type UpdateAuthorCommandHandler = CommandHandler<UpdateAuthorPayload, UpdateAuthorResult>;
