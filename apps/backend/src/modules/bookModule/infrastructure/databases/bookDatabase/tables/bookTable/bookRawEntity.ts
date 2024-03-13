import { type BookFormat } from '@common/contracts';

export interface BookRawEntity {
  readonly id: string;
  readonly title: string;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language: string;
  readonly translator?: string | undefined;
  readonly format: BookFormat;
  readonly pages?: number | undefined;
}
