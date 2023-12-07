import { faker } from '@faker-js/faker';

export class Generator {
  public static email(): string {
    return `jakub.barczewski+${Generator.number(100000000, 1)}@cloudflight.io`;
  }

  public static number(max: number, min = 0, precision = 1): number {
    return faker.number.float({
      min,
      max,
      precision,
    });
  }

  public static string(length: number): string {
    return faker.string.sample(length);
  }

  public static alphanumericString(length: number): string {
    return faker.string.alpha({
      casing: 'lower',
      length,
    });
  }

  public static uuid(): string {
    return faker.string.uuid();
  }

  public static arrayElement<T>(array: T[]): T {
    return faker.helpers.arrayElement(array);
  }

  public static firstName(): string {
    return faker.person.firstName();
  }

  public static lastName(): string {
    return faker.person.lastName();
  }

  public static word(): string {
    return faker.lorem.word({
      length: {
        min: 6,
        max: 20,
      },
    });
  }

  public static url(): string {
    return faker.internet.url();
  }

  public static boolean(): boolean {
    return faker.datatype.boolean();
  }

  public static password(length: number): string {
    return faker.internet.password({
      length,
    });
  }

  public static sentences(count = 3): string {
    return faker.lorem.sentences(count);
  }

  public static sentence(): string {
    return faker.lorem.sentence();
  }

  public static words(count = 3): string {
    return faker.lorem.words(count);
  }

  public static futureDate(): Date {
    return faker.date.future();
  }

  public static soonDate(days?: number): Date {
    const today = new Date();

    const nextDay = new Date(today);

    nextDay.setDate(today.getDate() + 1);

    return faker.date.soon({
      days: days ?? 1,
      refDate: nextDay,
    });
  }

  public static pastDate(): Date {
    return faker.date.past();
  }

  public static startOfDayDate(date: Date): Date {
    date.setMilliseconds(0);

    date.setSeconds(0);

    date.setMinutes(0);

    date.setHours(0);

    return date;
  }

  public static country(): string {
    return faker.location.country();
  }

  public static city(): string {
    return faker.location.city();
  }

  public static street(): string {
    return faker.location.street();
  }

  public static streetAddress(): string {
    return faker.location.streetAddress();
  }

  public static phoneNumber(): string {
    return '+18143519570';
  }

  public static buildingNumber(): string {
    return faker.location.buildingNumber();
  }

  public static department(): string {
    return faker.commerce.department();
  }

  public static state(): string {
    return faker.location.state();
  }

  public static zipCode(): string {
    return faker.location.zipCode();
  }

  public static iban(): string {
    return 'AL35202111090000000001234567';
  }

  public static bic(): string {
    return 'ALBPPLPW';
  }

  public static euVatNumber(): string {
    return 'ATU66492529';
  }

  public static switzerlandVatNumber(): string {
    return 'CHE-123.456.789';
  }

  public static companyName(): string {
    return faker.company.name();
  }

  public static imageUrl(width = 640, height = 480): string {
    return faker.image.url({
      width,
      height,
    });
  }

  public static array(count: number): null[] {
    const arr = Array(count) as undefined[];

    return [...arr].map(() => null);
  }

  public static productName(): string {
    return faker.commerce.product();
  }

  public static sku(): string {
    const productName = faker.commerce.product();

    const productNumber = Generator.number(100000, 1);

    return `${productName}-${productNumber}`;
  }

  public static region(): string {
    return 'eu-central-1';
  }

  public static timestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  public static commercetoolsProjectKey(): string {
    return 'philoro-dev';
  }

  public static price(): number {
    return Generator.number(10000, 0, 0.0001);
  }

  public static percentage(): number {
    return Generator.number(100, -100, 0.01);
  }
}
