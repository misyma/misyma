import { type UserRole } from '@common/contracts';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface UserState {
  currentUser: User | null;
  refreshToken: string;
  accessToken: string;
}
