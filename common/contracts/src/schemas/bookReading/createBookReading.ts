import { type BookReading } from './bookReading.js';

export interface CreateBookReadingPathParams {
  readonly bookId: string;
}

export interface CreateBookReadingBody {
  rating: number;
  comment: string;
  startedAt: Date;
  endedAt?: Date;
}

export interface CreateBookReadingResponseBody {
  readonly bookReading: BookReading;
}
