import { type UserApiSettings } from './userApiSettings.js';

export interface E2ETestsSettings {
  credentials: {
    email: string;
    password: string;
  };
  application: {
    url: string;
    pages: {
      login: string;
      register: string;
      logout: string;
    };
  };
  api: {
    user: UserApiSettings;
  };
  useMocks: boolean;
}
