import { type BookReading } from './bookReading.js';

export interface FindBookReadingByIdPathParams {
  readonly id: string;
  readonly userBookId: string;
}

export interface FindBookReadingByIdResponseBody extends BookReading {}
