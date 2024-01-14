export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
}

export interface UserState {
  currentUser: User | null;
}
