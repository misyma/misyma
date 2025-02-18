export interface QuoteDraft {
  readonly id: string;
  readonly userBookId: string;
  readonly content: string;
  readonly isFavorite: boolean;
  readonly createdAt: Date;
  readonly page?: string | undefined;
  readonly bookTitle?: string | undefined;
  readonly authors?: string[] | undefined;
}

export interface QuoteState {
  readonly userBookId: string;
  isFavorite: boolean;
  content: string;
  page?: string | undefined;
  readonly createdAt: Date;
  readonly bookTitle?: string | undefined;
  readonly authors?: string[] | undefined;
}

export interface SetContentPayload {
  readonly content: string;
}

export interface SetIsFavoritePayload {
  readonly isFavorite: boolean;
}

export interface SetPagePayload {
  readonly page: string;
}

export class Quote {
  private readonly id: string;
  private readonly state: QuoteState;

  public constructor(draft: QuoteDraft) {
    const { id, content, userBookId, isFavorite, page, createdAt, authors, bookTitle } = draft;

    this.id = id;

    let state: QuoteState = {
      userBookId,
      content,
      isFavorite,
      createdAt,
    };

    if (page !== undefined) {
      state.page = page;
    }

    if (authors !== undefined) {
      state = {
        ...state,
        authors,
      };
    }

    if (bookTitle) {
      state = {
        ...state,
        bookTitle,
      };
    }

    this.state = state;
  }

  public setContent(payload: SetContentPayload): void {
    const { content } = payload;

    this.state.content = content;
  }

  public setIsFavorite(payload: SetIsFavoritePayload): void {
    const { isFavorite } = payload;

    this.state.isFavorite = isFavorite;
  }

  public setPage(payload: SetPagePayload): void {
    const { page } = payload;

    this.state.page = page;
  }

  public getId(): string {
    return this.id;
  }

  public getUserBookId(): string {
    return this.state.userBookId;
  }

  public getContent(): string {
    return this.state.content;
  }

  public getCreatedAt(): Date {
    return this.state.createdAt;
  }

  public getIsFavorite(): boolean {
    return this.state.isFavorite;
  }

  public getPage(): string | undefined {
    return this.state.page;
  }

  public getAuthors(): string[] | undefined {
    return this.state.authors;
  }

  public getBookTitle(): string | undefined {
    return this.state.bookTitle;
  }

  public getState(): QuoteState {
    return this.state;
  }
}
