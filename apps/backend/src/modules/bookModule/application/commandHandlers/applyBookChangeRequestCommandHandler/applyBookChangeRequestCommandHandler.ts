import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface ApplyBookChangeRequestPayload {
  readonly bookChangeRequestId: string;
}

export type ApplyBookChangeRequestCommandHandler = CommandHandler<ApplyBookChangeRequestPayload, void>;
