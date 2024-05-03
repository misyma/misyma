import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type BookReading } from '../../../domain/entities/bookReading/bookReading.js';

export interface CreateBookReadingPayload {
  readonly userBookId: string;
  readonly rating: number;
  readonly comment: string;
  readonly startedAt: Date;
  readonly endedAt?: Date | undefined;
}

export interface CreateBookReadingResult {
  readonly bookReading: BookReading;
}

export type CreateBookReadingCommandHandler = CommandHandler<CreateBookReadingPayload, CreateBookReadingResult>;
