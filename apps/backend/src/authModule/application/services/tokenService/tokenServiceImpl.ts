/* eslint-disable import/no-named-as-default-member */

import jwt from 'jsonwebtoken';

import { type TokenService } from './tokenService.js';
import { type AuthModuleConfig } from '../../../authModuleConfig.js';

export class TokenServiceImpl implements TokenService {
  public constructor(private readonly config: AuthModuleConfig) {}

  public createToken(data: Record<string, string>): string {
    const { jwtSecret, jwtExpiresIn } = this.config;

    const token = jwt.sign(data, jwtSecret, {
      expiresIn: jwtExpiresIn,
      algorithm: 'HS512',
    });

    return token;
  }

  public verifyToken(token: string): Record<string, string> {
    const { jwtSecret } = this.config;

    const data = jwt.verify(token, jwtSecret, { algorithms: ['HS512'] });

    return data as Record<string, string>;
  }
}
