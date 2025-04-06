export const tokenTypes = {
  emailVerification: 'emailVerification',
  passwordReset: 'passwordReset',
  refreshToken: 'refreshToken',
  accessToken: 'accessToken',
} as const;

export type TokenType = (typeof tokenTypes)[keyof typeof tokenTypes];
