import { type BookDomainAction } from './domainActions/bookDomainActions.js';
import { BookDomainActionType } from './domainActions/bookDomainActionType.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type Author } from '../../../../authorModule/domain/entities/author/author.js';

export interface BookDraft {
  readonly id: string;
  readonly title: string;
  readonly releaseYear: number;
  readonly authors?: Author[];
}

export class Book {
  private readonly id: string;
  private readonly title: string;
  private readonly releaseYear: number;
  private readonly authors: Author[] = [];

  private domainActions: BookDomainAction[] = [];

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

  public getDomainActions(): BookDomainAction[] {
    return [...this.domainActions];
  }

  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public getReleaseYear(): number {
    return this.releaseYear;
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

    this.domainActions.push({
      type: BookDomainActionType.addAuthor,
      payload: {
        authorId,
      },
    });

    this.authors.push(author);
  }

  public deleteAuthor(author: Author): void {
    const authorId = author.id;

    const authorExists = this.authors.findIndex((author) => author.id === authorId);

    if (!authorExists) {
      throw new OperationNotValidError({
        reason: 'Author is not assigned to this book.',
        value: authorId,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.deleteAuthor,
      payload: {
        authorId,
      },
    });

    this.authors.splice(authorExists, 1);
  }

  public getAuthors(): Author[] {
    return [...this.authors];
  }
}
