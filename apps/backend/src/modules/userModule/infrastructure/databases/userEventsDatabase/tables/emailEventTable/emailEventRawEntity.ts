export interface EmailPayload {
  email: string;
  emailEventType: string;
  firstName: string;
  lastName: string;
  [key: string]: unknown;
}

export interface EmailEventRawEntity {
  id: string;
  payload: EmailPayload;
  status: string;
  createdAt: Date;
}
