import { type ResetPasswordTokenRawEntity } from './resetPasswordTokenRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class ResetPasswordTokenTable implements DatabaseTable<ResetPasswordTokenRawEntity> {
  public readonly name = 'resetPasswordTokens';
  public readonly columns = {
    id: 'id',
    userId: 'userId',
    token: 'token',
    expiresAt: 'expiresAt',
  } as const;
}
