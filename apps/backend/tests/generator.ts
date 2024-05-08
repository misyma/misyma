import { faker } from '@faker-js/faker';

import { BookFormat, BookshelfType, Language, ReadingStatus, UserRole } from '@common/contracts';

export class Generator {
  public static email(): string {
    return faker.internet.email().toLowerCase();
  }

  public static number(min = 0, max = 100, precision = 1): number {
    return faker.number.float({
      min,
      max,
      multipleOf: precision,
    });
  }

  public static string(length: number): string {
    return faker.string.sample(length);
  }

  public static alphaString(length: number, casing: 'lower' | 'upper' = 'lower'): string {
    return faker.string.alpha({
      casing,
      length,
    });
  }

  public static numericString(length: number): string {
    return faker.string.numeric({
      length,
    });
  }

  public static uuid(): string {
    return faker.string.uuid();
  }

  public static arrayElement<T>(array: T[]): T {
    return faker.helpers.arrayElement(array);
  }

  public static fullName(): string {
    return `${faker.person.firstName()} ${faker.person.lastName()}`;
  }

  public static word(): string {
    return faker.lorem.word();
  }

  public static boolean(): boolean {
    return faker.datatype.boolean();
  }

  public static password(): string {
    let password = faker.internet.password({
      length: 13,
    });

    password += Generator.alphaString(1, 'upper');

    password += Generator.alphaString(1, 'lower');

    password += Generator.numericString(1);

    return password;
  }

  public static sentences(count = 3): string {
    return faker.lorem.sentences(count);
  }

  public static words(count = 3): string {
    return faker.lorem.words(count);
  }

  public static futureDate(): Date {
    return faker.date.future();
  }

  public static pastDate(): Date {
    return faker.date.past();
  }

  public static streetAddress(): string {
    return faker.location.streetAddress();
  }

  public static imageUrl(width = 640, height = 480): string {
    return faker.image.url({
      width,
      height,
    });
  }

  public static isbn(): string {
    return faker.commerce.isbn({ variant: 13 });
  }

  public static language(): Language {
    return faker.helpers.arrayElement([Language.English, Language.Polish, Language.German, Language.French]);
  }

  public static bookFormat(): BookFormat {
    return faker.helpers.arrayElement([BookFormat.paperback, BookFormat.hardcover, BookFormat.ebook]);
  }

  public static readingStatus(): ReadingStatus {
    return faker.helpers.arrayElement([ReadingStatus.toRead, ReadingStatus.inProgress, ReadingStatus.finished]);
  }

  public static userRole(): UserRole {
    return faker.helpers.arrayElement([UserRole.admin, UserRole.user]);
  }

  public static bookshelfType(): BookshelfType {
    return faker.helpers.arrayElement([BookshelfType.standard, BookshelfType.archive, BookshelfType.borrowing]);
  }
}
