import {
  type VerifyBearerTokenPayload,
  type AccessControlService,
  type VerifyBearerTokenResult,
} from './accessControlService.js';
import { ForbiddenAccessError } from '../../errors/forbiddenAccessError.js';
import { UnauthorizedAccessError } from '../../errors/unathorizedAccessError.js';
import { type TokenService } from '../tokenService/tokenService.js';

// TODO: add integration tests
export class AccessControlServiceImpl implements AccessControlService {
  public constructor(private readonly tokenService: TokenService) {}

  public async verifyBearerToken(payload: VerifyBearerTokenPayload): Promise<VerifyBearerTokenResult> {
    const { authorizationHeader, expectedUserId } = payload;

    if (!authorizationHeader) {
      throw new UnauthorizedAccessError({
        reason: 'Authorization header not provided.',
      });
    }

    const [authorizationType, token] = authorizationHeader.split(' ');

    if (authorizationType !== 'Bearer') {
      throw new UnauthorizedAccessError({
        reason: 'Bearer authorization type not provided.',
      });
    }

    let tokenPayload;

    try {
      tokenPayload = this.tokenService.verifyToken({ token: token as string });
    } catch (error) {
      throw new UnauthorizedAccessError({
        reason: 'Invalid access token.',
      });
    }

    const accessTokenPayload = tokenPayload as unknown as VerifyBearerTokenResult;

    if (expectedUserId && accessTokenPayload.userId !== expectedUserId) {
      throw new ForbiddenAccessError({
        reason: 'User id does not match User id from token.',
      });
    }

    return accessTokenPayload;
  }
}
