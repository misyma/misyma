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
  readonly isApproved: boolean;
  readonly imageUrl: string | null;
  readonly authorId: string | null;
  readonly authorName: string | null;
  readonly isAuthorApproved: boolean | null;
}
