import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';

export interface BookReadingDraft {
  readonly id: string;
  readonly userBookId: string;
  readonly rating: number;
  readonly comment: string;
  readonly startedAt: Date;
  readonly endedAt?: Date | undefined;
}

export interface BookReadingState {
  userBookId: string;
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

export interface SetReadingDatesPayload {
  readonly startedAt: Date;
  readonly endedAt: Date;
}

export interface SetStartedAtDatePayload {
  readonly startedAt: Date;
}

export interface SetEndedAtDatePayload {
  readonly endedAt: Date;
}

export class BookReading {
  private readonly id: string;
  private readonly state: BookReadingState;

  public constructor(draft: BookReadingDraft) {
    this.id = draft.id;

    this.state = {
      userBookId: draft.userBookId,
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

  public setReadingDates(payload: SetReadingDatesPayload): void {
    const { startedAt, endedAt } = payload;

    if (startedAt > endedAt) {
      throw new OperationNotValidError({
        reason: 'StartedAt date cannot be after ended date.',
      });
    }

    this.state.startedAt = startedAt;

    this.state.endedAt = endedAt;
  }

  public setStartedAtDate(payload: SetStartedAtDatePayload): void {
    const { startedAt } = payload;

    if (this.state.endedAt && startedAt > this.state.endedAt) {
      throw new OperationNotValidError({
        reason: 'StartedAt date cannot be after ended date.',
      });
    }

    this.state.startedAt = startedAt;
  }

  public setEndedAtDate(payload: SetEndedAtDatePayload): void {
    const { endedAt } = payload;

    if (endedAt < this.state.startedAt) {
      throw new OperationNotValidError({
        reason: 'EndedAt date cannot be before started date.',
      });
    }

    this.state.endedAt = endedAt;
  }

  public getId(): string {
    return this.id;
  }

  public getUserBookId(): string {
    return this.state.userBookId;
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
