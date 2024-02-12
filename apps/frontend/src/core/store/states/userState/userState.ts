export interface User {
  id: string;
  email: string;
}

export interface UserState {
  currentUser: User | null;
  refreshToken: string | null;
  accessToken: string | null;
}
