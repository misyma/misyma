import { type BookReadingDomainAction } from './bookReadingDomainActions/bookReadingDomainAction.js';
import { BookReadingDomainActionType } from './bookReadingDomainActions/bookReadingDomainActionType.js';

export interface BookReadingState {
  readonly id: string;
  readonly bookId: string;
  readonly rating: number;
  readonly comment: string;
  readonly startedAt: Date;
  readonly endedAt?: Date | undefined;
}

export interface AddUpdateCommentDomainActionPayload {
  comment: string;
}

export interface AddUpdateRatingDomainActionPayload {
  rating: number;
}

export interface AddUpdateStartedDateDomainActionPayload {
  startedAt: Date;
}

export interface AddUpdateEndedDateDomainActionPayload {
  endedAt: Date;
}

export class BookReading {
  private readonly state: BookReadingState;

  private readonly actions: BookReadingDomainAction[] = [];

  public constructor(state: BookReadingState) {
    this.state = state;
  }

  public getState(): BookReadingState {
    return { ...this.state };
  }

  public getDomainActions(): BookReadingDomainAction[] {
    return [...this.actions];
  }

  public addUpadateCommentDomainAction(payload: AddUpdateCommentDomainActionPayload): void {
    this.actions.push({
      actionName: BookReadingDomainActionType.updateComment,
      payload,
    });
  }

  public addUpdateRatingDomainAction(payload: AddUpdateRatingDomainActionPayload): void {
    this.actions.push({
      actionName: BookReadingDomainActionType.updateRating,
      payload,
    });
  }

  public addUpdateStartedDateDomainAction(payload: AddUpdateStartedDateDomainActionPayload): void {
    this.actions.push({
      actionName: BookReadingDomainActionType.updateStartedDate,
      payload,
    });
  }

  public addUpdateEndedDateDomainAction(payload: AddUpdateEndedDateDomainActionPayload): void {
    this.actions.push({
      actionName: BookReadingDomainActionType.updateEndedDate,
      payload,
    });
  }

  public getId(): string {
    return this.state.id;
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
