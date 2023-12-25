/* eslint-disable import/no-named-as-default-member */

import jwt from 'jsonwebtoken';

import { type TokenService } from './tokenService.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type AuthModuleConfigProvider } from '../../../authModuleConfigProvider.js';

export class TokenServiceImpl implements TokenService {
  public constructor(private readonly configProvider: AuthModuleConfigProvider) {}

  public createToken(data: Record<string, string>): string {
    const jwtSecret = this.configProvider.getJwtSecret();

    const jwtExpiresIn = this.configProvider.getJwtExpiresIn();

    const token = jwt.sign(data, jwtSecret, {
      expiresIn: jwtExpiresIn,
      algorithm: 'HS512',
    });

    return token;
  }

  public verifyToken(token: string): Record<string, string> {
    const jwtSecret = this.configProvider.getJwtSecret();

    try {
      const data = jwt.verify(token, jwtSecret, { algorithms: ['HS512'] });

      return data as Record<string, string>;
    } catch (error) {
      throw new OperationNotValidError({
        reason: 'Token is not valid.',
        token,
      });
    }
  }
}
