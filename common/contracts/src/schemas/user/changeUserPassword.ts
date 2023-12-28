export interface ChangeUserPasswordBody {
  readonly password: string;
  readonly repeatedPassword: string;
  readonly token: string;
}
