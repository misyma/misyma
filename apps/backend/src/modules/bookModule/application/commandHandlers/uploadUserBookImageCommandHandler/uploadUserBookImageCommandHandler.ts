import { type Readable } from 'node:stream';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';

export interface UploadUserBookImageCommandHandlerPayload {
  readonly userBookId: string;
  readonly data: Readable;
  readonly contentType: string;
}

export type UploadUserBookImageCommandHandler = CommandHandler<UploadUserBookImageCommandHandlerPayload, void>;
