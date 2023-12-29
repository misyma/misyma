export interface BookWithAuthorRawEntity {
  readonly id: string;
  readonly title: string;
  readonly releaseYear: number;
  readonly authorId: string | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
}
