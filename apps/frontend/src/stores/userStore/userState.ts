export interface User {
  id: number;
  name: string;
}

export interface UserState {
  currentUser: User | null;
}
