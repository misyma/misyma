import config from 'config';

export class E2ETestConfigProvider {
  public static getTestUserEmail(): string {
    return config.get('credentials.email');
  }

  public static getTestUserPassword(): string {
    return config.get('credentials.password');
  }

  public static areMocksEnabled(): boolean {
    return config.get<boolean>('useMocks');
  }

  public static getApplicationUrl(): string {
    return config.get<string>('application.url');
  }
}
