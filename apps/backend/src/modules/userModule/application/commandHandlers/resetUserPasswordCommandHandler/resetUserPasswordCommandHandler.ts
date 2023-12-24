import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface ExecutePayload {
  readonly email: string;
}

// TODO: rename to SendResetPasswordEmailCommandHandler
// and create ResetUserPasswordCommandHandler for actual password reset
export type ResetUserPasswordCommandHandler = CommandHandler<ExecutePayload, void>;
