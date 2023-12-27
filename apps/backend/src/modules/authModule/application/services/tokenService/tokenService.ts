export interface CreateTokenPayload {
  readonly data: Record<string, string>;
  readonly expiresIn: number;
}

export interface VerifyTokenPayload {
  readonly token: string;
}

export interface TokenService {
  createToken(payload: CreateTokenPayload): string;
  verifyToken(payload: VerifyTokenPayload): Record<string, string>;
}
