import { type BaseEmailPayload } from './types/baseEmailPayload.js';

export interface EmailEventState {
  id: string;
  status: string;
  payload: BaseEmailPayload;
  createdAt: Date;
}

export class EmailEvent {
  private id: string;

  private status: string;

  private payload: BaseEmailPayload;

  private createdAt: Date;

  public constructor(draft: EmailEventState) {
    const { id, status, payload, createdAt } = draft;

    this.id = id;

    this.status = status;

    this.payload = payload;

    this.createdAt = createdAt;
  }

  public getId(): string {
    return this.id;
  }

  public getStatus(): string {
    return this.status;
  }

  public getPayload(): unknown {
    return this.payload;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
}
