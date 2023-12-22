import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
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
  public readonly authors: Author[] = [];

  public constructor(draft: BookDraft) {
    const { id, title, releaseYear, authors } = draft;

    this.id = id;

    this.title = title;

    this.releaseYear = releaseYear;

    if (authors) {
      this.authors = authors;
    }
  }

  public getState(): BookDraft {
    return {
      id: this.id,
      title: this.title,
      releaseYear: this.releaseYear,
      authors: [...this.authors],
    };
  }

  // Idea: We could add domainEvents, including the deletion and addition of authors.
  // This way we could delete/add them within the booksRepository ^^
  public addAuthor(author: Author): void {
    const authorId = author.id;

    const authorExists = this.authors.some((author) => author.id === authorId);

    if (authorExists) {
      throw new OperationNotValidError({
        reason: 'Author is already assigned to this book.',
        value: authorId,
      });
    }

    this.authors.push(author);
  }

  public getAuthors(): Author[] {
    return [...this.authors];
  }
}
