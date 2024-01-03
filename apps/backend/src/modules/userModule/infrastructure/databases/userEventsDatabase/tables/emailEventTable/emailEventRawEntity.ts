export interface EmailPayload {
  email: string;
  emailName: string;
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
