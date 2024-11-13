import { type Language, type BookFormat } from '@common/contracts';

export interface BookRawEntity {
  readonly id: string;
  readonly title: string;
  readonly isbn?: string | undefined | null;
  readonly publisher?: string | undefined | null;
  readonly releaseYear?: number | undefined | null;
  readonly language: Language;
  readonly translator?: string | undefined | null;
  readonly format: BookFormat;
  readonly pages?: number | undefined | null;
  readonly isApproved: boolean;
  readonly imageUrl?: string | undefined | null;
  readonly createdAt: Date;
}
