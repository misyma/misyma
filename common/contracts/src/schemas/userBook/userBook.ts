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
    readonly isApproved: boolean;
    readonly imageUrl?: string;
    readonly authors: Author[];
  };
  readonly imageUrl?: string;
  readonly status: ReadingStatus;
  readonly bookshelfId: string;
  readonly genres: Genre[];
}
