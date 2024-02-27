import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';

export interface BookReadingDraft {
  readonly id: string;
  readonly bookId: string;
  readonly rating: number;
  readonly comment: string;
  readonly startedAt: Date;
  readonly endedAt?: Date | undefined;
}

export interface BookReadingState {
  bookId: string;
  rating: number;
  comment: string;
  startedAt: Date;
  endedAt?: Date | undefined;
}

export interface SetCommentPayload {
  readonly comment: string;
}

export interface SetRatingPayload {
  readonly rating: number;
}

export interface SetStartedDatePayload {
  readonly startedAt: Date;
}

export interface SetEndedDatePayload {
  readonly endedAt: Date;
}

export class BookReading {
  private readonly id: string;
  private readonly state: BookReadingState;

  public constructor(draft: BookReadingDraft) {
    this.id = draft.id;

    this.state = {
      bookId: draft.bookId,
      rating: draft.rating,
      comment: draft.comment,
      startedAt: draft.startedAt,
      endedAt: draft.endedAt,
    };
  }

  public setComment(payload: SetCommentPayload): void {
    const { comment } = payload;

    this.state.comment = comment;
  }

  public setRating(payload: SetRatingPayload): void {
    const { rating } = payload;

    this.state.rating = rating;
  }

  public setStartedDate(payload: SetStartedDatePayload): void {
    const { startedAt } = payload;

    if (this.state.endedAt && startedAt > this.state.endedAt) {
      throw new OperationNotValidError({
        reason: 'Started date cannot be after ended date.',
      });
    }

    this.state.startedAt = startedAt;
  }

  public setEndedDate(payload: SetEndedDatePayload): void {
    const { endedAt } = payload;

    if (endedAt < this.state.startedAt) {
      throw new OperationNotValidError({
        reason: 'Ended date cannot be before started date.',
      });
    }

    this.state.endedAt = endedAt;
  }

  public getId(): string {
    return this.id;
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

  public getState(): BookReadingState {
    return this.state;
  }
}
