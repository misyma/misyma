import { Generator } from '../../../../../../tests/generator.js';
import { type UserRawEntity } from '../../../../databaseModule/infrastructure/tables/userTable/userRawEntity.js';
import { User, type UserDraft } from '../../../domain/entities/user/user.js';

export class UserTestFactory {
  public create(input: Partial<UserDraft> = {}): User {
    return new User({
      id: Generator.uuid(),
      email: Generator.email(),
      password: Generator.password(),
      name: Generator.fullName(),
      isEmailVerified: Generator.boolean(),
      role: Generator.userRole(),
      ...input,
    });
  }

  public createRaw(input: Partial<UserRawEntity> = {}): UserRawEntity {
    return {
      id: Generator.uuid(),
      email: Generator.email(),
      password: Generator.password(),
      name: Generator.fullName(),
      is_email_verified: Generator.boolean(),
      role: Generator.userRole(),
      ...input,
    };
  }
}
