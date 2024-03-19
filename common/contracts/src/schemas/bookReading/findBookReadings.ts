import { type BookReading } from './bookReading.js';

export interface FindBookReadingsPathParams {
  readonly userBookId: string;
}

export interface FindBookReadingsResponseBody {
  readonly data: BookReading[];
}
