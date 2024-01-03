export interface EmailEventRawEntity {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  eventName: string;
  processed: boolean;
  createdAt: Date;
}
