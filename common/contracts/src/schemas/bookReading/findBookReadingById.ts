import { type BookReading } from './bookReading.js';

export interface FindBookReadingByIdPathParams {
  readonly id: string;
  readonly bookId: string;
}

export interface FindBookReadingByIdResponseBody {
  readonly bookReading: BookReading;
}
