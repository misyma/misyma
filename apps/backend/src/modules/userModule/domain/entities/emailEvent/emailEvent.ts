import { type EmailType } from '../../../../../common/types/emailType.js';

import { type BaseEmailPayload } from './types/baseEmailPayload.js';
import { type EmailEventStatus } from './types/emailEventStatus.js';

export interface EmailEventDraftState {
  payload: BaseEmailPayload;
  eventName: EmailType;
}

export class EmailEventDraft {
  private payload: BaseEmailPayload;

  private eventName: EmailType;

  public constructor(draft: EmailEventDraftState) {
    const { payload, eventName } = draft;

    this.payload = payload;

    this.eventName = eventName;
  }

  public getPayload(): BaseEmailPayload {
    return this.payload;
  }

  public getEmailEventName(): EmailType {
    return this.eventName;
  }
}

export interface EmailEventState {
  id: string;
  status: EmailEventStatus;
  eventName: EmailType;
  payload: BaseEmailPayload;
  createdAt: Date;
}

export class EmailEvent {
  private id: string;

  private status: EmailEventStatus;

  private payload: BaseEmailPayload;

  private createdAt: Date;

  private eventName: EmailType;

  public constructor(draft: EmailEventState) {
    const { id, status, payload, createdAt, eventName } = draft;

    this.id = id;

    this.status = status;

    this.payload = payload;

    this.createdAt = createdAt;

    this.eventName = eventName;
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

  public getEmailEventName(): EmailType {
    return this.eventName;
  }

  public getRecipientEmail(): string {
    return this.payload.recipientEmail;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
}
