import { type Mapper } from '../../../../../common/types/mapper.js';
import { type User } from '../../../../domain/entities/user/user.js';
import { type UserRawEntity } from '../../../databases/userDatabase/tables/userTable/userRawEntity.js';

export type UserMapper = Mapper<UserRawEntity, User>;
