import { type BookReading } from './bookReading.js';

export interface FindBookReadingByIdParams {
  readonly id: string;
}

export interface FindBookReadingByIdResponseBody {
  readonly bookReading: BookReading;
}
