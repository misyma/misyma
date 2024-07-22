import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type User } from '../../../domain/entities/user/user.js';

export interface UpdateUserCommandHandlerPayload {
  readonly id: string;
  readonly name: string;
}

export interface UpdateUserCommandHandlerResult {
  readonly user: User;
}

export type UpdateUserCommandHandler = CommandHandler<UpdateUserCommandHandlerPayload, UpdateUserCommandHandlerResult>;
