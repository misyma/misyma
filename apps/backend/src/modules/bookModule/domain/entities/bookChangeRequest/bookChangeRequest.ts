import { type Language, type BookFormat } from '@common/contracts';

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
  readonly userId: string;
  readonly bookId: string;
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
  readonly userId: string;
  readonly bookId: string;
}

export class BookChangeRequest {
  private readonly id: string;
  private readonly state: BookChangeRequestState;

  public constructor(draft: BookChangeRequestDraft) {
    const { id, title, isbn, publisher, releaseYear, language, translator, format, pages, imageUrl, bookId, userId } =
      draft;

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
      userId,
    };
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

  public getUserId(): string {
    return this.state.userId;
  }

  public getBookId(): string {
    return this.state.bookId;
  }
}
