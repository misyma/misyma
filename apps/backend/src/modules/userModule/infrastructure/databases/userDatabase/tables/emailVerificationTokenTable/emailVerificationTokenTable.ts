import { type EmailVerificationTokenRawEntity } from './emailVerificationTokenRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class EmailVerificationTokenTable implements DatabaseTable<EmailVerificationTokenRawEntity> {
  public readonly name = 'emailVerificationTokens';
  public readonly columns = {
    id: 'id',
    userId: 'userId',
    token: 'token',
    expiresAt: 'expiresAt',
  } as const;
}
