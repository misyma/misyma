import { type Readable } from 'node:stream';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type Bookshelf } from '../../../domain/entities/bookshelf/bookshelf.js';

export interface UploadBookshelfImageCommandHandlerPayload {
  readonly userId: string;
  readonly bookshelfId: string;
  readonly data: Readable;
  readonly contentType: string;
}

export interface UploadBookshelfImageCommandHandlerResult {
  readonly bookshelf: Bookshelf;
}

export type UploadBookshelfImageCommandHandler = CommandHandler<
  UploadBookshelfImageCommandHandlerPayload,
  UploadBookshelfImageCommandHandlerResult
>;
