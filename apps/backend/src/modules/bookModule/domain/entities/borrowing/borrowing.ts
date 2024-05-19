import { OperationNotValidError } from '../../../../../common/errors/operationNotValidError.js';

export interface BorrowingDraft {
  readonly id: string;
  readonly userBookId: string;
  readonly borrower: string;
  readonly startedAt: Date;
  readonly endedAt?: Date | undefined;
}

export interface BorrowingState {
  userBookId: string;
  borrower: string;
  startedAt: Date;
  endedAt?: Date | undefined;
}

export interface SetBorrowerPayload {
  readonly borrower: string;
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

export class Borrowing {
  private readonly id: string;
  private readonly state: BorrowingState;

  public constructor(draft: BorrowingDraft) {
    this.id = draft.id;

    this.state = {
      userBookId: draft.userBookId,
      borrower: draft.borrower,
      startedAt: draft.startedAt,
      endedAt: draft.endedAt,
    };
  }

  public setBorrower(payload: SetBorrowerPayload): void {
    const { borrower } = payload;

    this.state.borrower = borrower;
  }

  public setBorrowingDates(payload: SetReadingDatesPayload): void {
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

  public getBorrower(): string {
    return this.state.borrower;
  }

  public getStartedAt(): Date {
    return this.state.startedAt;
  }

  public getEndedAt(): Date | undefined {
    return this.state.endedAt;
  }

  public getState(): BorrowingState {
    return this.state;
  }
}
