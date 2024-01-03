import { type EmailEventType } from './emailEventType.js';

export interface BaseEmailPayload {
  email: string;
  firstName: string;
  lastName: string;
  emailEventType: EmailEventType;
  [key: string]: unknown;
}
