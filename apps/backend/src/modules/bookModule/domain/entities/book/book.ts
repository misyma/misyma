import { type BookFormat } from '@common/contracts';

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
    const { id, title, isbn, publisher, releaseYear, language, translator, format, pages, authors, genres } = draft;

    this.id = id;

    this.state = {
      title,
      language,
      format,
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
