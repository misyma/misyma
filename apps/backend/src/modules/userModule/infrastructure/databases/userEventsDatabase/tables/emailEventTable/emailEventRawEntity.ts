export interface EmailEventRawEntity {
  readonly id: string;
  readonly payload: string;
  readonly eventName: string;
  readonly status: string;
  readonly createdAt: Date;
}
