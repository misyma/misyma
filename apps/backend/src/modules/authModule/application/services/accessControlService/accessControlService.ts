import { type UserRole } from '@common/contracts';

export interface VerifyBearerTokenPayload {
  readonly requestHeaders: Record<string, string>;
  readonly expectedUserId?: string | undefined;
  readonly expectedRole?: UserRole | undefined;
}

export interface VerifyBearerTokenResult {
  readonly userId: string;
  readonly role: UserRole;
}

export interface AccessControlService {
  verifyBearerToken(payload: VerifyBearerTokenPayload): Promise<VerifyBearerTokenResult>;
}
