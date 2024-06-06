export interface QuoteDraft {
  readonly id: string;
  readonly userBookId: string;
  readonly content: string;
  readonly isFavorite: boolean;
  readonly createdAt: Date;
  readonly page?: string | undefined;
}

export interface QuoteState {
  readonly userBookId: string;
  isFavorite: boolean;
  content: string;
  page?: string | undefined;
  readonly createdAt: Date;
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
    this.id = draft.id;

    this.state = {
      userBookId: draft.userBookId,
      content: draft.content,
      isFavorite: draft.isFavorite,
      createdAt: draft.createdAt,
    };

    if (draft.page !== undefined) {
      this.state.page = draft.page;
    }
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

  public getState(): QuoteState {
    return this.state;
  }
}
