import { type EmailEventRawEntity } from './emailEventRawEntity.js';

export const emailEventTable = 'emailEvents';

export const emailEventColumns: Record<keyof EmailEventRawEntity, string> = {
  id: `${emailEventTable}.id`,
  payload: `${emailEventTable}.payload`,
  eventName: `${emailEventTable}.eventName`,
  createdAt: `${emailEventTable}.createdAt`,
  status: `${emailEventTable}.status`,
};
