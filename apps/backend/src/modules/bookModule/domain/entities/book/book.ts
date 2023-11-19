export interface BookDraft {
  readonly id: string;
  readonly title: string;
  readonly releaseYear: number;
  readonly authorId: string;
}

export class Book {
  public readonly id: string;
  public readonly title: string;
  public readonly releaseYear: number;
  public readonly authorId: string;

  public constructor(draft: BookDraft) {
    const { id, title, releaseYear, authorId } = draft;

    this.id = id;

    this.title = title;

    this.releaseYear = releaseYear;

    this.authorId = authorId;
  }
}
