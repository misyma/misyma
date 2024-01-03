import { type BaseEmailPayload } from '../types/baseEmailPayload.js';

export interface EmailEventDraftState {
  payload: BaseEmailPayload;
}

export class EmailEventDraft {
  private payload: BaseEmailPayload;

  public constructor(draft: EmailEventDraftState) {
    const { payload } = draft;

    this.payload = payload;
  }

  public getPayload(): unknown {
    return this.payload;
  }
}
