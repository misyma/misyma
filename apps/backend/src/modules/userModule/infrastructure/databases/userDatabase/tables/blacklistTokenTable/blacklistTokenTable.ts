import { type BlacklistTokenRawEntity } from './blacklistTokenRawEntity.js';

export const blacklistTokenTable = 'blacklistTokens';

export const blacklistTokenColumns: Record<keyof BlacklistTokenRawEntity, string> = {
  id: `${blacklistTokenTable}.id`,
  token: `${blacklistTokenTable}.token`,
  expiresAt: `${blacklistTokenTable}.expiresAt`,
};
