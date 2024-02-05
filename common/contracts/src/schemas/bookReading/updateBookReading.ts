import { type BookReading } from './bookReading.js';

export interface UpdateBookReadingBody {
  readonly comment?: string;
  readonly rating?: number;
  readonly startedAt?: Date;
  readonly endedAt?: Date;
}

export interface UpdateBookReadingPathParams {
  readonly id: string;
}

export interface UpdateBookReadingResponseBody {
  readonly bookReading: BookReading;
}
