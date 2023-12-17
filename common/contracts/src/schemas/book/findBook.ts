export interface FindBookPathParams {
  readonly id: string;
}

export interface FindBookResponseBody {
  readonly id: string;
  readonly title: string;
  readonly releaseYear: number;
  readonly authorId: string;
}
