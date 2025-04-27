import { type UserRawEntity } from '../../../../../databaseModule/infrastructure/tables/userTable/userRawEntity.js';
import { type User } from '../../../../domain/entities/user/user.js';

export interface UserMapper {
  mapToDomain(rawEntity: UserRawEntity): User;
}
