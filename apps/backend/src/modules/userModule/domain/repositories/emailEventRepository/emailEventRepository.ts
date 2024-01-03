import { type EmailEvent } from '../../entities/emailEvent/emailEvent.js';
import { type EmailEventDraft } from '../../entities/emailEvent/emailEventDraft.ts/emailEventDraft.js';

export interface FindAllCreatedAfterPayload {
  after: Date;
}

export interface UpdateStatusPayload {
  id: string;
  status: string;
}

export interface EmailEventRepository {
  findAllCreatedAfter(payload: FindAllCreatedAfterPayload): Promise<EmailEvent[]>;
  findAllUnprocessed(): Promise<EmailEvent[]>;
  updateStatus(payload: UpdateStatusPayload): Promise<void>;
  deleteProcessed(): Promise<void>;
  create(entity: EmailEventDraft): Promise<void>;
}
