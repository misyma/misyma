export interface BaseEmailPayload {
  email: string;
  firstName: string;
  lastName: string;
  emailName: string;
  [key: string]: unknown;
}
