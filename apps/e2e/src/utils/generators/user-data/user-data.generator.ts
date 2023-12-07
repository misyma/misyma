import { faker } from '@faker-js/faker';

export class UserDataGenerator {
  public static uuid(): string {
    return faker.string.uuid();
  }

  public static email(): string {
    return faker.internet.email();
  }

  public static username(): string {
    return faker.internet.userName();
  }

  public static password(length: number): string {
    return faker.internet.password({
      length,
    });
  }
}
