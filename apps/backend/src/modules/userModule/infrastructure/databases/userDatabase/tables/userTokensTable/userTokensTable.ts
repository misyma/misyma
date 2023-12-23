import { type UserTokensRawEntity } from './userTokensRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class UserTokensTable implements DatabaseTable<UserTokensRawEntity> {
  public readonly name = 'userTokens';
  public readonly columns = {
    id: 'id',
    userId: 'userId',
    refreshToken: 'string',
    resetPasswordToken: 'resetPasswordToken',
  } as const;
}
