import { type Author } from '../author/author.js';
import { type BookFormat } from '../book/bookFormat.js';
import { type Language } from '../book/language.js';
import { type BookReading } from '../bookReading/bookReading.js';
import { type Collection } from '../collection/collection.js';

import { type ReadingStatus } from './readingStatus.js';

export interface UserBook {
  readonly id: string;
  readonly bookId: string;
  readonly book: {
    readonly title: string;
    readonly categoryId: string;
    readonly categoryName?: string;
    readonly isbn?: string;
    readonly publisher?: string;
    readonly releaseYear: number;
    readonly language: Language;
    readonly translator?: string;
    readonly format?: BookFormat;
    readonly pages?: number;
    readonly isApproved: boolean;
    readonly imageUrl?: string;
    readonly authors: Author[];
    readonly createdAt: string;
  };
  readonly imageUrl?: string;
  readonly status: ReadingStatus;
  readonly isFavorite: boolean;
  readonly bookshelfId: string;
  readonly createdAt: string;
  readonly collections: Collection[];
  readonly readings: BookReading[];
  readonly latestRating?: number;
}
