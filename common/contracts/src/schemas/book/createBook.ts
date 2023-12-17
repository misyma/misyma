export interface CreateBookBody {
  readonly title: string;
  readonly releaseYear: number;
  readonly authorId: string;
}

export interface CreateBookResponseBody {
  readonly id: string;
  readonly title: string;
  readonly releaseYear: number;
  readonly authorId: string;
}
