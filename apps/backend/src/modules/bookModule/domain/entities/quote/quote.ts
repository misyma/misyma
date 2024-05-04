export interface QuoteDraft {
  readonly id: string;
  readonly userBookId: string;
  readonly content: string;
  readonly isFavorite: boolean;
  readonly createdAt: Date;
}

export interface QuoteState {
  readonly userBookId: string;
  isFavorite: boolean;
  content: string;
  readonly createdAt: Date;
}

export interface SetContentPayload {
  readonly content: string;
}

export interface SetIsFavoritePayload {
  readonly isFavorite: boolean;
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
  }

  public setContent(payload: SetContentPayload): void {
    const { content } = payload;

    this.state.content = content;
  }

  public setIsFavorite(payload: SetIsFavoritePayload): void {
    const { isFavorite } = payload;

    this.state.isFavorite = isFavorite;
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

  public getState(): QuoteState {
    return this.state;
  }
}
