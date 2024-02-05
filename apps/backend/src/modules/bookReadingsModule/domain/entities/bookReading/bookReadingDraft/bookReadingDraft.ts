export interface BookReadingDraftState {
  readonly bookId: string;
  readonly rating: number;
  readonly comment: string;
  readonly startedAt: Date;
  readonly endedAt?: Date | undefined;
}

export class BookReadingDraft {
  private readonly state: BookReadingDraftState;

  public constructor(state: BookReadingDraftState) {
    this.state = state;
  }

  public getState(): BookReadingDraftState {
    return this.state;
  }

  public getBookId(): string {
    return this.state.bookId;
  }

  public getRating(): number {
    return this.state.rating;
  }

  public getComment(): string {
    return this.state.comment;
  }

  public getStartedAt(): Date {
    return this.state.startedAt;
  }

  public getEndedAt(): Date | undefined {
    return this.state.endedAt;
  }
}
