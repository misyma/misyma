import config from 'config';

import { type UserApiSettings } from './types/userApiSettings.js';

export class E2ETestConfigProvider {
  public static getTestUserEmail(): string {
    return config.get('credentials.email');
  }

  public static getTestUserPassword(): string {
    return config.get('credentials.password');
  }

  public static getUserApiSettings(): UserApiSettings {
    return config.get<UserApiSettings>('api.user');
  }

  public static areMocksEnabled(): boolean {
    return config.get<boolean>('useMocks');
  }

  public static getApplicationUrl(): string {
    return config.get<string>('application.url');
  }

  public static getLoginPageUrl(): string {
    return config.get<string>('application.pages.login');
  }

  public static getRegisterPageUrl(): string {
    return config.get<string>('application.pages.register');
  }

  public static getLogoutPageUrl(): string {
    return config.get<string>('application.pages.logout');
  }
}
