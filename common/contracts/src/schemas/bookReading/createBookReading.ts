import { type BookReading } from './bookReading.js';

export interface CreateBookReadingBody {
  bookId: string;
  rating: number;
  comment: string;
  startedAt: Date;
  endedAt?: Date;
}

export interface CreateBookReadingResponseBody {
  readonly bookReading: BookReading;
}
