import { type BookReading } from './bookReading.js';

export interface FindBookReadingsPathParams {
  readonly bookId: string;
}

export interface FindBookReadingsResponseBody {
  readonly bookReadings: BookReading[];
}
