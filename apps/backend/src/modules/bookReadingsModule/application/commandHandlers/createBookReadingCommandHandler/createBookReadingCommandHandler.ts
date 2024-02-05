import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

export interface CreateBookReadingPayload {
  bookId: string;
  rating: number;
  comment: string;
  startedAt: Date;
  endedAt?: Date | undefined;
}

export interface CreateBookReadingResult {
  bookReading: BookReading;
}

export type CreateBookReadingCommandHandler = CommandHandler<CreateBookReadingPayload, CreateBookReadingResult>;
