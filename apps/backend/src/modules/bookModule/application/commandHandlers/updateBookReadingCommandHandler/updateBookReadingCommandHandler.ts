import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

export interface UpdateBookReadingPayload {
  readonly id: string;
  readonly comment?: string | undefined;
  readonly rating?: number | undefined;
  readonly startedAt?: Date | undefined;
  readonly endedAt?: Date | undefined;
}

export interface UpdateBookReadingResult {
  readonly bookReading: BookReading;
}

export type UpdateBookReadingCommandHandler = CommandHandler<UpdateBookReadingPayload, UpdateBookReadingResult>;
