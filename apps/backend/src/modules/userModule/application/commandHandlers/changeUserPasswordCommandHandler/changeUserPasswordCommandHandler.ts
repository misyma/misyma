import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface ExecutePayload {
  readonly userId: string;
  readonly newPassword: string;
  readonly repeatedNewPassword: string;
  readonly resetPasswordToken: string;
}

export type ChangeUserPasswordCommandHandler = CommandHandler<ExecutePayload, void>;
