import { type BookFormat, type ReadingStatus } from '@common/contracts';

export interface UserBookWithJoinsRawEntity {
  readonly userBookId: string;
  readonly bookId: string;
  readonly title: string;
  readonly isbn: string | null;
  readonly publisher: string | null;
  readonly releaseYear: number | null;
  readonly language: string;
  readonly translator: string | null;
  readonly format: BookFormat;
  readonly pages: number | null;
  readonly imageUrl: string | null;
  readonly status: ReadingStatus;
  readonly bookshelfId: string;
  readonly authorId: string | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly genreName: string | null;
  readonly genreId: string | null;
}
