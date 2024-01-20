export interface BookRawEntity {
  readonly id: string;
  readonly title: string;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language: string;
  readonly translator?: string | undefined;
  readonly format: string;
  readonly pages?: number | undefined;
  readonly frontCoverImageUrl?: string | undefined;
  readonly backCoverImageUrl?: string | undefined;
  readonly status: string;
  readonly bookshelfId: string;
}
