import { type UserDomainActionType } from './userDomainActionType.js';

export interface UpdateRefreshTokenDomainAction {
  actionName: UserDomainActionType.updateRefreshToken;
  payload: {
    refreshToken: string;
  };
}
