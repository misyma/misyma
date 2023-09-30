import {
  type VerifyBearerTokenPayload,
  type AccessControlService,
  type VerifyBearerTokenResult,
} from './accessControlService.js';
import { SecurityMode } from '../../../../../common/types/http/securityMode.js';
import { UnauthorizedAccessError } from '../../errors/unathorizedAccessError.js';
import { type TokenService } from '../tokenService/tokenService.js';

// TODO: add integration tests
export class AccessControlServiceImpl implements AccessControlService {
  public constructor(private readonly tokenService: TokenService) {}

  public async verifyBearerToken(payload: VerifyBearerTokenPayload): Promise<VerifyBearerTokenResult> {
    const { authorizationHeader } = payload;

    if (!authorizationHeader) {
      throw new UnauthorizedAccessError({
        securityMode: SecurityMode.bearer,
        reason: 'Authorization header not provided.',
      });
    }

    const [authorizationType, token] = authorizationHeader.split(' ');

    if (authorizationType !== 'Bearer') {
      throw new UnauthorizedAccessError({
        securityMode: SecurityMode.bearer,
        reason: 'Bearer authorization type not provided.',
      });
    }

    try {
      const tokenPayload = this.tokenService.verifyToken(token as string);

      if (!tokenPayload) {
        throw new UnauthorizedAccessError({
          securityMode: SecurityMode.bearer,
          reason: 'Invalid access token.',
        });
      }

      return tokenPayload as unknown as VerifyBearerTokenResult;
    } catch (error) {
      throw new UnauthorizedAccessError({
        securityMode: SecurityMode.bearer,
        reason: 'Invalid access token.',
      });
    }
  }
}
