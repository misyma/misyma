export interface UserTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserTokensState {
  tokens: UserTokens | null;
}
