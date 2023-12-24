import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface ExecutePayload {
  readonly userId: string;
}

export type SendVerificationEmailCommandHandler = CommandHandler<ExecutePayload, void>;
