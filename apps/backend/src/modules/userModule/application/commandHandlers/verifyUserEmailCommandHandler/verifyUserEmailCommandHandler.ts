import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface ExecutePayload {
  readonly userId: string;
  readonly token: string;
}

export type VerifyUserEmailCommandHandler = CommandHandler<ExecutePayload, void>;
