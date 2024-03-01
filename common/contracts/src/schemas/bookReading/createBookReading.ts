import { type BookReading } from './bookReading.js';

export interface CreateBookReadingPathParams {
  readonly bookId: string;
}

export interface CreateBookReadingRequestBody {
  readonly rating: number;
  readonly comment: string;
  readonly startedAt: string;
  readonly endedAt?: string;
}

export interface CreateBookReadingResponseBody {
  readonly bookReading: BookReading;
}
