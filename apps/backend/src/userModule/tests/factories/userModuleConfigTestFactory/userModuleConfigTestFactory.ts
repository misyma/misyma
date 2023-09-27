import { Generator } from '../../../../common/tests/generator.js';
import { type UserModuleConfig } from '../../../userModuleConfig.js';

export class UserModuleConfigTestFactory {
  public create(input: Partial<UserModuleConfig> = {}): UserModuleConfig {
    return {
      jwtSecret: Generator.password(12),
      jwtExpiresIn: Generator.number(500000, 1000000).toString(),
      hashSaltRounds: Generator.number(5, 10),
      ...input,
    };
  }
}
