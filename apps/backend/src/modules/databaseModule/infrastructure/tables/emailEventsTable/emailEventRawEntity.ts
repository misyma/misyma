export interface EmailEventRawEntity {
  readonly id: string;
  readonly payload: string;
  readonly event_name: string;
  readonly status: string;
  readonly created_at: Date;
}
