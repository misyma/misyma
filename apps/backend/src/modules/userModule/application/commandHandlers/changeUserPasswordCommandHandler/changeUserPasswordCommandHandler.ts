import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface ChangeUserPasswordCommandHandlerPayload {
  readonly newPassword: string;
  readonly identifier:
    | {
        readonly resetPasswordToken: string;
      }
    | {
        readonly userId: string;
      };
}

export type ChangeUserPasswordCommandHandler = CommandHandler<ChangeUserPasswordCommandHandlerPayload, void>;
