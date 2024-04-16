import { type Language, type BookFormat } from '@common/contracts';

export interface BookRawEntity {
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
