import { type BookFormat } from './bookFormat.js';
import { type BookStatus } from './bookStatus.js';
import { type Author } from '../author/author.js';
import { type Genre } from '../genre/genre.js';

export interface Book {
  readonly id: string;
  readonly title: string;
  readonly isbn?: string;
  readonly publisher?: string;
  readonly releaseYear?: number;
  readonly language: string;
  readonly translator?: string;
  readonly format: BookFormat;
  readonly pages?: number;
  readonly frontCoverImageUrl?: string;
  readonly backCoverImageUrl?: string;
  readonly status: BookStatus;
  readonly bookshelfId: string;
  readonly authors: Author[];
  readonly genres: Genre[];
}
