import { type BookFormat, type BookStatus } from '@common/contracts';

import { type BookDomainAction } from './domainActions/bookDomainActions.js';
import { BookDomainActionType } from './domainActions/bookDomainActionType.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type Author } from '../../../../authorModule/domain/entities/author/author.js';
import { type Genre } from '../genre/genre.js';

export interface BookDraft {
  readonly id: string;
  readonly title: string;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language: string;
  readonly translator?: string | undefined;
  readonly format: BookFormat;
  readonly pages?: number | undefined;
  readonly frontCoverImageUrl?: string | undefined;
  readonly backCoverImageUrl?: string | undefined;
  readonly status: BookStatus;
  readonly bookshelfId: string;
  readonly authors?: Author[];
  readonly genres?: Genre[];
}

export interface AddUpdateTitleDomainActionPayload {
  readonly title: string;
}

export interface AddUpdateIsbnDomainActionPayload {
  readonly isbn: string;
}

export interface AddUpdatePublisherDomainActionPayload {
  readonly publisher: string;
}

export interface AddUpdateReleaseYearDomainActionPayload {
  readonly releaseYear: number;
}

export interface AddUpdateLanguageDomainActionPayload {
  readonly language: string;
}

export interface AddUpdateTranslatorDomainActionPayload {
  readonly translator: string;
}

export interface AddUpdateFormatDomainActionPayload {
  readonly format: BookFormat;
}

export interface AddUpdatePagesDomainActionPayload {
  readonly pages: number;
}

export interface AddUpdateFrontCoverImageUrlDomainActionPayload {
  readonly frontCoverImageUrl: string;
}

export interface AddUpdateBackCoverImageUrlDomainActionPayload {
  readonly backCoverImageUrl: string;
}

export interface AddUpdateStatusDomainActionPayload {
  readonly status: BookStatus;
}

export interface AddUpdateBookshelfDomainActionPayload {
  readonly bookshelfId: string;
}

export interface AddUpdateBookGenresDomainActionPayload {
  readonly genres: Genre[];
}

export class Book {
  private readonly id: string;
  private title: string;
  private isbn?: string;
  private publisher?: string;
  private releaseYear?: number;
  private language: string;
  private translator?: string;
  private format: BookFormat;
  private pages?: number;
  private frontCoverImageUrl?: string;
  private backCoverImageUrl?: string;
  private status: BookStatus;
  private bookshelfId: string;
  private genres: Genre[] = [];
  private readonly authors: Author[] = [];

  private domainActions: BookDomainAction[] = [];

  public constructor(draft: BookDraft) {
    const {
      id,
      title,
      isbn,
      publisher,
      releaseYear,
      language,
      translator,
      format,
      pages,
      frontCoverImageUrl,
      backCoverImageUrl,
      status,
      bookshelfId,
      authors,
      genres,
    } = draft;

    this.id = id;

    this.title = title;

    if (isbn) {
      this.isbn = isbn;
    }

    if (publisher) {
      this.publisher = publisher;
    }

    if (releaseYear !== undefined) {
      this.releaseYear = releaseYear;
    }

    this.language = language;

    if (translator) {
      this.translator = translator;
    }

    this.format = format;

    if (pages) {
      this.pages = pages;
    }

    if (frontCoverImageUrl) {
      this.frontCoverImageUrl = frontCoverImageUrl;
    }

    if (backCoverImageUrl) {
      this.backCoverImageUrl = backCoverImageUrl;
    }

    this.status = status;

    this.bookshelfId = bookshelfId;

    if (authors) {
      this.authors = authors;
    }

    if (genres) {
      this.genres = genres;
    }
  }

  public getState(): BookDraft {
    return {
      id: this.id,
      title: this.title,
      isbn: this.isbn,
      publisher: this.publisher,
      releaseYear: this.releaseYear,
      language: this.language,
      translator: this.translator,
      format: this.format,
      pages: this.pages,
      frontCoverImageUrl: this.frontCoverImageUrl,
      backCoverImageUrl: this.backCoverImageUrl,
      status: this.status,
      bookshelfId: this.bookshelfId,
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

  public getIsbn(): string | undefined {
    return this.isbn;
  }

  public getPublisher(): string | undefined {
    return this.publisher;
  }

  public getReleaseYear(): number | undefined {
    return this.releaseYear;
  }

  public getLanguage(): string {
    return this.language;
  }

  public getTranslator(): string | undefined {
    return this.translator;
  }

  public getFormat(): BookFormat {
    return this.format;
  }

  public getPages(): number | undefined {
    return this.pages;
  }

  public getFrontCoverImageUrl(): string | undefined {
    return this.frontCoverImageUrl;
  }

  public getBackCoverImageUrl(): string | undefined {
    return this.backCoverImageUrl;
  }

  public getStatus(): BookStatus {
    return this.status;
  }

  public getBookshelfId(): string {
    return this.bookshelfId;
  }

  public getAuthors(): Author[] {
    return [...this.authors];
  }

  public getGenres(): Genre[] {
    return [...this.genres];
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

  public addUpdateTitleDomainAction(payload: AddUpdateTitleDomainActionPayload): void {
    const { title } = payload;

    if (this.title === title) {
      throw new OperationNotValidError({
        reason: 'Cannot update Title, because it is the same as the current one.',
        value: title,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.updateTitle,
      payload: {
        title,
      },
    });

    this.title = title;
  }

  public addUpdateIsbnDomainAction(payload: AddUpdateIsbnDomainActionPayload): void {
    const { isbn } = payload;

    if (this.isbn === isbn) {
      throw new OperationNotValidError({
        reason: 'Cannot update ISBN, because it is the same as the current one.',
        value: isbn,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.updateIsbn,
      payload: {
        isbn,
      },
    });

    this.isbn = isbn;
  }

  public addUpdatePublisherDomainAction(payload: AddUpdatePublisherDomainActionPayload): void {
    const { publisher } = payload;

    if (this.publisher === publisher) {
      throw new OperationNotValidError({
        reason: 'Cannot update Publisher, because it is the same as the current one.',
        value: publisher,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.updatePublisher,
      payload: {
        publisher,
      },
    });

    this.publisher = publisher;
  }

  public addUpdateReleaseYearDomainAction(payload: AddUpdateReleaseYearDomainActionPayload): void {
    const { releaseYear } = payload;

    if (this.releaseYear === releaseYear) {
      throw new OperationNotValidError({
        reason: 'Cannot update Release Year, because it is the same as the current one.',
        value: releaseYear,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.updateReleaseYear,
      payload: {
        releaseYear,
      },
    });

    this.releaseYear = releaseYear;
  }

  public addUpdateLanguageDomainAction(payload: AddUpdateLanguageDomainActionPayload): void {
    const { language } = payload;

    if (this.language === language) {
      throw new OperationNotValidError({
        reason: 'Cannot update Language, because it is the same as the current one.',
        value: language,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.updateLanguage,
      payload: {
        language,
      },
    });

    this.language = language;
  }

  public addUpdateTranslatorDomainAction(payload: AddUpdateTranslatorDomainActionPayload): void {
    const { translator } = payload;

    if (this.translator === translator) {
      throw new OperationNotValidError({
        reason: 'Cannot update Translator, because it is the same as the current one.',
        value: translator,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.updateTranslator,
      payload: {
        translator,
      },
    });

    this.translator = translator;
  }

  public addUpdateFormatDomainAction(payload: AddUpdateFormatDomainActionPayload): void {
    const { format } = payload;

    if (this.format === format) {
      throw new OperationNotValidError({
        reason: 'Cannot update Format, because it is the same as the current one.',
        value: format,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.updateFormat,
      payload: {
        format,
      },
    });

    this.format = format;
  }

  public addUpdatePagesDomainAction(payload: AddUpdatePagesDomainActionPayload): void {
    const { pages } = payload;

    if (this.pages === pages) {
      throw new OperationNotValidError({
        reason: 'Cannot update Pages, because they are the same as the current ones.',
        value: pages,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.updatePages,
      payload: {
        pages,
      },
    });

    this.pages = pages;
  }

  public addUpdateFrontCoverImageUrlDomainAction(payload: AddUpdateFrontCoverImageUrlDomainActionPayload): void {
    const { frontCoverImageUrl } = payload;

    if (this.frontCoverImageUrl === frontCoverImageUrl) {
      throw new OperationNotValidError({
        reason: 'Cannot update Front Cover Image URL, because it is the same as the current one.',
        value: frontCoverImageUrl,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.updateFrontCoverImageUrl,
      payload: {
        frontCoverImageUrl,
      },
    });

    this.frontCoverImageUrl = frontCoverImageUrl;
  }

  public addUpdateBackCoverImageUrlDomainAction(payload: AddUpdateBackCoverImageUrlDomainActionPayload): void {
    const { backCoverImageUrl } = payload;

    if (this.backCoverImageUrl === backCoverImageUrl) {
      throw new OperationNotValidError({
        reason: 'Cannot update Back Cover Image URL, because it is the same as the current one.',
        value: backCoverImageUrl,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.updateBackCoverImageUrl,
      payload: {
        backCoverImageUrl,
      },
    });

    this.backCoverImageUrl = backCoverImageUrl;
  }

  public addUpdateStatusDomainAction(payload: AddUpdateStatusDomainActionPayload): void {
    const { status } = payload;

    if (this.status === status) {
      throw new OperationNotValidError({
        reason: 'Cannot update Status, because it is the same as the current one.',
        value: status,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.updateStatus,
      payload: {
        status,
      },
    });

    this.status = status;
  }

  public addUpdateBookshelfDomainAction(payload: AddUpdateBookshelfDomainActionPayload): void {
    const { bookshelfId } = payload;

    if (this.bookshelfId === bookshelfId) {
      throw new OperationNotValidError({
        reason: 'Cannot update Bookshelf, because it is the same as the current one.',
        value: bookshelfId,
      });
    }

    this.domainActions.push({
      type: BookDomainActionType.updateBookshelf,
      payload: {
        bookshelfId,
      },
    });

    this.bookshelfId = bookshelfId;
  }

  public addUpdateBookGenresAction(payload: AddUpdateBookGenresDomainActionPayload): void {
    const { genres } = payload;

    const addedGenres = genres.filter(
      (genre) => !this.genres.some((currentGenre) => currentGenre.getId() === genre.getId()),
    );

    const removedGenres = this.genres.filter(
      (genre) => !genres.some((currentGenre) => currentGenre.getId() === genre.getId()),
    );

    this.domainActions.push({
      type: BookDomainActionType.updateBookGenres,
      payload: {
        addedGenres,
        removedGenres,
      },
    });

    this.genres = genres;
  }
}
