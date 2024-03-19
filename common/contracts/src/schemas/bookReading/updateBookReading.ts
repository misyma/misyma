import { type BookReading } from './bookReading.js';

export interface UpdateBookReadingRequestBody {
  readonly comment?: string;
  readonly rating?: number;
  readonly startedAt?: string;
  readonly endedAt?: string;
}

export interface UpdateBookReadingPathParams {
  readonly id: string;
  readonly userBookId: string;
}

export interface UpdateBookReadingResponseBody extends BookReading {}
