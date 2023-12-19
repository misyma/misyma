import { type Author } from '../../../../authorModule/domain/entities/author/author.js';

export interface BookDraft {
  readonly id: string;
  readonly title: string;
  readonly releaseYear: number;
  readonly authors?: Author[];
}

export class Book {
  public readonly id: string;
  public readonly title: string;
  public readonly releaseYear: number;
  public readonly authors?: Author[];

  public constructor(draft: BookDraft) {
    const { id, title, releaseYear, authors } = draft;

    this.id = id;

    this.title = title;

    this.releaseYear = releaseYear;

    if (authors) {
      this.authors = authors;
    }
  }
}
