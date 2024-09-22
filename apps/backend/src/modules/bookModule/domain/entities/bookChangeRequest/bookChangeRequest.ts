import { type Language, type BookFormat } from '@common/contracts';

import { type BookDraft } from '../book/book.js';

export interface BookChangeRequestDraft {
  readonly id: string;
  readonly title?: string | undefined;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language?: Language | undefined;
  readonly translator?: string | undefined;
  readonly format?: BookFormat | undefined;
  readonly pages?: number | undefined;
  readonly imageUrl?: string | undefined;
  readonly authorIds?: string[] | undefined;
  readonly userEmail: string;
  readonly bookId: string;
  readonly book?: BookDraft | undefined;
  readonly createdAt: Date;
}

export interface BookChangeRequestState {
  readonly title?: string | undefined;
  readonly isbn?: string | undefined;
  readonly publisher?: string | undefined;
  readonly releaseYear?: number | undefined;
  readonly language?: Language | undefined;
  readonly translator?: string | undefined;
  readonly format?: BookFormat | undefined;
  readonly pages?: number | undefined;
  readonly imageUrl?: string | undefined;
  readonly authorIds?: string[] | undefined;
  readonly userEmail: string;
  readonly bookId: string;
  readonly book?: BookDraft | undefined;
  readonly createdAt: Date;
}

export class BookChangeRequest {
  private readonly id: string;
  private readonly state: BookChangeRequestState;

  public constructor(draft: BookChangeRequestDraft) {
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
      bookId,
      userEmail,
      createdAt,
      authorIds,
      book,
    } = draft;

    this.id = id;

    this.state = {
      title,
      isbn,
      publisher,
      releaseYear,
      language,
      translator,
      format,
      pages,
      imageUrl,
      bookId,
      userEmail,
      createdAt,
      authorIds,
    };

    if (book) {
      this.state = {
        ...this.state,
        book,
      };
    }
  }

  public getState(): BookChangeRequestState {
    return this.state;
  }

  public getId(): string {
    return this.id;
  }

  public getTitle(): string | undefined {
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

  public getLanguage(): Language | undefined {
    return this.state.language;
  }

  public getTranslator(): string | undefined {
    return this.state.translator;
  }

  public getFormat(): BookFormat | undefined {
    return this.state.format;
  }

  public getImageUrl(): string | undefined {
    return this.state.imageUrl;
  }

  public getPages(): number | undefined {
    return this.state.pages;
  }

  public getAuthorIds(): string[] | undefined {
    return this.state.authorIds;
  }

  public getUserEmail(): string {
    return this.state.userEmail;
  }

  public getBookId(): string {
    return this.state.bookId;
  }

  public getBook(): BookDraft | undefined {
    return this.state.book;
  }

  public getCreatedAt(): Date {
    return this.state.createdAt;
  }
}
