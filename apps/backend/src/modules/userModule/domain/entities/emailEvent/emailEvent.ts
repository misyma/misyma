import { type BaseEmailPayload } from './types/baseEmailPayload.js';
import { type EmailEventStatus } from './types/emailEventStatus.js';
import { type EmailEventType } from './types/emailEventType.js';

export interface EmailEventState {
  id: string;
  status: EmailEventStatus;
  payload: BaseEmailPayload;
  createdAt: Date;
}

export class EmailEvent {
  private id: string;

  private status: EmailEventStatus;

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

  public getStatus(): EmailEventStatus {
    return this.status;
  }

  public getPayload(): BaseEmailPayload {
    return this.payload;
  }

  public getEmailEventType(): EmailEventType {
    return this.payload['emailEventType'];
  }

  public getEmail(): string {
    return this.payload.email;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
}
