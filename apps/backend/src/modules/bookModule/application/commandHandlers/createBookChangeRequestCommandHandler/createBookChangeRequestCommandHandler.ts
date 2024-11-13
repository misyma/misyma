import { type Language, type BookFormat } from '@common/contracts';

import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type BookChangeRequest } from '../../../domain/entities/bookChangeRequest/bookChangeRequest.js';

export interface CreateBookChangeRequestCommandHandlerPayload {
  readonly bookId: string;
  readonly userId: string;
  readonly title?: string | undefined;
  readonly isbn?: string | undefined | null;
  readonly publisher?: string | undefined | null;
  readonly releaseYear?: number | undefined | null;
  readonly language?: Language | undefined;
  readonly translator?: string | undefined | null;
  readonly format?: BookFormat | undefined;
  readonly pages?: number | undefined | null;
  readonly imageUrl?: string | undefined | null;
  readonly authorIds?: string[] | undefined;
}

export interface CreateBookChangeRequestCommandHandlerResult {
  readonly bookChangeRequest: BookChangeRequest;
}

export type CreateBookChangeRequestCommandHandler = CommandHandler<
  CreateBookChangeRequestCommandHandlerPayload,
  CreateBookChangeRequestCommandHandlerResult
>;
