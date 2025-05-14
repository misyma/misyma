import { type UserRawEntity } from '../../../../../databaseModule/infrastructure/tables/usersTable/userRawEntity.js';
import { User } from '../../../../domain/entities/user/user.js';

import { type UserMapper } from './userMapper.js';

export class UserMapperImpl implements UserMapper {
  public mapToDomain(entity: UserRawEntity): User {
    const { id, email, password, name, is_email_verified: isEmailVerified, role } = entity;

    return new User({
      id,
      email,
      password,
      name,
      isEmailVerified,
      role,
    });
  }
}
