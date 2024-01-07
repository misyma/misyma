export interface EmailPayload {
  email: string;
  firstName: string;
  lastName: string;
  [key: string]: unknown;
}

export interface EmailEventRawEntity {
  id: string;
  payload: EmailPayload;
  eventName: string;
  status: string;
  createdAt: Date;
}
