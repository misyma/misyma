import { type UserDomainActionType } from './userDomainActionType.js';

export interface UpdateNameDomainAction {
  actionName: UserDomainActionType.updateName;
  payload: {
    name: string;
  };
}
