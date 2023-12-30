export interface VerifyBearerTokenPayload {
  readonly authorizationHeader: string | undefined;
  readonly expectedUserId?: string;
}

export interface VerifyBearerTokenResult {
  readonly userId: string;
}

export interface AccessControlService {
  verifyBearerToken(payload: VerifyBearerTokenPayload): Promise<VerifyBearerTokenResult>;
}
