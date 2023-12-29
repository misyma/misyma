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

export interface AddChangeReleaseYearDomainActionPayload {
  readonly releaseYear: number;
}

export interface AddChangeTitleDomainActionPayload {
  readonly title: string;
}

export class Book {
  private readonly id: string;
  private title: string;
  private releaseYear: number;
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

  public addAddAuthorDomainAction(author: Author): void {
    const authorId = author.getId();

    const authorExists = this.authors.some((author) => author.getId() === authorId);

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

  public addDeleteAuthorDomainAction(author: Author): void {
    const authorId = author.getId();

    const authorExists = this.authors.findIndex((author) => author.getId() === authorId);

    if (authorExists < 0) {
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

  public addChangeTitleDomainAction(payload: AddChangeTitleDomainActionPayload): void {
    const { title } = payload;

    if (this.title === title) {
      throw new OperationNotValidError({
        reason: 'Cannot update Title, because it is the same as the current one.',
        value: title,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.changeTitle,
      payload: {
        title,
      },
    });

    this.title = title;
  }

  public addChangeReleaseYearDomainAction(payload: AddChangeReleaseYearDomainActionPayload): void {
    const { releaseYear } = payload;

    if (this.releaseYear === releaseYear) {
      throw new OperationNotValidError({
        reason: 'Cannot update Release Year, because it is the same as the current one.',
        value: releaseYear,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.changeReleaseYear,
      payload: {
        releaseYear,
      },
    });

    this.releaseYear = releaseYear;
  }

  public getAuthors(): Author[] {
    return [...this.authors];
  }
}
