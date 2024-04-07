import { type BookFormat } from '@common/contracts';

export interface BookWithJoinsRawEntity {
  readonly id: string;
  readonly title: string;
  readonly isbn: string | null;
  readonly publisher: string | null;
  readonly releaseYear: number | null;
  readonly language: string;
  readonly translator: string | null;
  readonly format: BookFormat;
  readonly pages: number | null;
  readonly authorId: string | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
}
