export interface BaseEmailPayload {
  recipientEmail: string;
  firstName: string;
  lastName: string;
  [key: string]: unknown;
}
