import { type BookFormat, type Language } from '@common/contracts';

export interface Book {
  readonly id: string;
  readonly title: string;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language: Language;
  readonly translator?: string | undefined;
  readonly format: BookFormat;
  readonly pages?: number | undefined;
  readonly isApproved: boolean;
  readonly imageUrl?: string | undefined;
}

export interface BookDraft {
  readonly title: string;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language: Language;
  readonly translator?: string | undefined;
  readonly format: BookFormat;
  readonly pages?: number | undefined;
  readonly isApproved: boolean;
  readonly imageUrl?: string | undefined;
  readonly authorNames: string[];
}
