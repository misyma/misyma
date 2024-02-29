import { type BookReading } from './bookReading.js';

export interface CreateBookReadingPathParams {
  readonly bookId: string;
}

export interface CreateBookReadingRequestBody {
  readonly rating: number;
  readonly comment: string;
  readonly startedAt: Date;
  readonly endedAt?: Date;
}

export interface CreateBookReadingResponseBody {
  readonly bookReading: BookReading;
}
