export const emailEventStatuses = {
  pending: 'pending',
  processing: 'processing',
  processed: 'processed',
  failed: 'failed',
} as const;

export type EmailEventStatus = (typeof emailEventStatuses)[keyof typeof emailEventStatuses];
