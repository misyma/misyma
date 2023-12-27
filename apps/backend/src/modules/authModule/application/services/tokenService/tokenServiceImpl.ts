/* eslint-disable import/no-named-as-default-member */

import jwt from 'jsonwebtoken';

import { type CreateTokenPayload, type VerifyTokenPayload, type TokenService } from './tokenService.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type AuthModuleConfigProvider } from '../../../authModuleConfigProvider.js';

export class TokenServiceImpl implements TokenService {
  public constructor(private readonly configProvider: AuthModuleConfigProvider) {}

  public createToken(payload: CreateTokenPayload): string {
    const { data, expiresIn } = payload;

    const jwtSecret = this.configProvider.getJwtSecret();

    const token = jwt.sign(data, jwtSecret, {
      expiresIn,
      algorithm: 'HS512',
    });

    return token;
  }

  public verifyToken(payload: VerifyTokenPayload): Record<string, string> {
    const { token } = payload;

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
