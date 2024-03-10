import { type BookFormat, type BookStatus } from '@common/contracts';

import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';
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
  readonly imageUrl?: string | undefined;
  readonly status: BookStatus;
  readonly bookshelfId: string;
  readonly authors: Author[];
  readonly genres: Genre[];
}

export interface BookState {
  title: string;
  isbn?: string | undefined;
  publisher?: string | undefined;
  releaseYear?: number | undefined;
  language: string;
  translator?: string | undefined;
  format: BookFormat;
  pages?: number | undefined;
  imageUrl?: string | undefined;
  status: BookStatus;
  bookshelfId: string;
  authors: Author[];
  genres: Genre[];
}

export interface SetTitlePayload {
  readonly title: string;
}

export interface SetIsbnPayload {
  readonly isbn: string;
}

export interface SetPublisherPayload {
  readonly publisher: string;
}

export interface SetReleaseYearPayload {
  readonly releaseYear: number;
}

export interface SetLanguagePayload {
  readonly language: string;
}

export interface SetTranslatorPayload {
  readonly translator: string;
}

export interface SetFormatPayload {
  readonly format: BookFormat;
}

export interface SetPagesPayload {
  readonly pages: number;
}

export interface SetImageUrlPayload {
  readonly imageUrl: string;
}

export interface SetStatusPayload {
  readonly status: BookStatus;
}

export interface SetBookshelfPayload {
  readonly bookshelfId: string;
}

export interface SetAuthorsPayload {
  readonly authors: Author[];
}

export interface SetGenresPayload {
  readonly genres: Genre[];
}

export class Book {
  private readonly id: string;
  private readonly state: BookState;

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
      imageUrl,
      status,
      bookshelfId,
      authors,
      genres,
    } = draft;

    this.id = id;

    this.state = {
      title,
      language,
      format,
      status,
      bookshelfId,
      authors,
      genres,
    };

    if (isbn) {
      this.state.isbn = isbn;
    }

    if (publisher) {
      this.state.publisher = publisher;
    }

    if (releaseYear !== undefined) {
      this.state.releaseYear = releaseYear;
    }

    if (translator) {
      this.state.translator = translator;
    }

    if (pages) {
      this.state.pages = pages;
    }

    if (imageUrl) {
      this.state.imageUrl = imageUrl;
    }
  }

  public getState(): BookState {
    return this.state;
  }

  public getId(): string {
    return this.id;
  }

  public getTitle(): string {
    return this.state.title;
  }

  public getIsbn(): string | undefined {
    return this.state.isbn;
  }

  public getPublisher(): string | undefined {
    return this.state.publisher;
  }

  public getReleaseYear(): number | undefined {
    return this.state.releaseYear;
  }

  public getLanguage(): string {
    return this.state.language;
  }

  public getTranslator(): string | undefined {
    return this.state.translator;
  }

  public getFormat(): BookFormat {
    return this.state.format;
  }

  public getPages(): number | undefined {
    return this.state.pages;
  }

  public getImageUrl(): string | undefined {
    return this.state.imageUrl;
  }

  public getStatus(): BookStatus {
    return this.state.status;
  }

  public getBookshelfId(): string {
    return this.state.bookshelfId;
  }

  public getAuthors(): Author[] {
    return this.state.authors ? [...this.state.authors] : [];
  }

  public getGenres(): Genre[] {
    return this.state.genres ? [...this.state.genres] : [];
  }

  public setTitle(payload: SetTitlePayload): void {
    const { title } = payload;

    this.state.title = title;
  }

  public setIsbn(payload: SetIsbnPayload): void {
    const { isbn } = payload;

    this.state.isbn = isbn;
  }

  public setPublisher(payload: SetPublisherPayload): void {
    const { publisher } = payload;

    this.state.publisher = publisher;
  }

  public setReleaseYear(payload: SetReleaseYearPayload): void {
    const { releaseYear } = payload;

    this.state.releaseYear = releaseYear;
  }

  public setLanguage(payload: SetLanguagePayload): void {
    const { language } = payload;

    this.state.language = language;
  }

  public setTranslator(payload: SetTranslatorPayload): void {
    const { translator } = payload;

    this.state.translator = translator;
  }

  public setFormat(payload: SetFormatPayload): void {
    const { format } = payload;

    this.state.format = format;
  }

  public setPages(payload: SetPagesPayload): void {
    const { pages } = payload;

    this.state.pages = pages;
  }

  public setImageUrl(payload: SetImageUrlPayload): void {
    const { imageUrl } = payload;

    this.state.imageUrl = imageUrl;
  }

  public setStatus(payload: SetStatusPayload): void {
    const { status } = payload;

    this.state.status = status;
  }

  public setBookshelf(payload: SetBookshelfPayload): void {
    const { bookshelfId } = payload;

    this.state.bookshelfId = bookshelfId;
  }

  public addAuthor(author: Author): void {
    const authorId = author.getId();

    const authorExists = this.state.authors.some((author) => author.getId() === authorId);

    if (authorExists) {
      throw new OperationNotValidError({
        reason: 'Author is already assigned to this book.',
        value: authorId,
      });
    }

    this.state.authors = [...this.state.authors, author];
  }

  public deleteAuthor(author: Author): void {
    const authorId = author.getId();

    const authorIndex = this.state.authors.findIndex((author) => author.getId() === authorId);

    if (authorIndex < 0) {
      throw new OperationNotValidError({
        reason: 'Author is not assigned to this book.',
        value: authorId,
      });
    }

    this.state.authors.splice(authorIndex, 1);
  }

  public setGenres(payload: SetGenresPayload): void {
    const { genres } = payload;

    this.state.genres = genres;
  }
}
