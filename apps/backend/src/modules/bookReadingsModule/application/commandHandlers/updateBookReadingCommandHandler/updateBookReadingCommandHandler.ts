import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

export interface UpdateBookReadingPayload {
  id: string;
  comment?: string | undefined;
  rating?: number | undefined;
  startedAt?: Date | undefined;
  endedAt?: Date | undefined;
}

export interface UpdateBookReadingResult {
  bookReading: BookReading;
}

export type UpdateBookReadingCommandHandler = CommandHandler<UpdateBookReadingPayload, UpdateBookReadingResult>;
