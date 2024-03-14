import { type ReadingStatus } from './readingStatus.js';
import { type Author } from '../author/author.js';
import { type BookFormat } from '../book/bookFormat.js';
import { type Genre } from '../genre/genre.js';

export interface UserBook {
  readonly id: string;
  readonly bookId: string;
  readonly book: {
    readonly title: string;
    readonly isbn?: string;
    readonly publisher?: string;
    readonly releaseYear?: number;
    readonly language: string;
    readonly translator?: string;
    readonly format: BookFormat;
    readonly pages?: number;
    readonly imageUrl?: string;
    readonly status: ReadingStatus;
    readonly bookshelfId: string;
    readonly authors: Author[];
    readonly genres: Genre[];
  };
  readonly imageUrl?: string;
  readonly status: ReadingStatus;
  readonly bookshelfId: string;
}
