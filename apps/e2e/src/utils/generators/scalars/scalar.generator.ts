import { faker } from '@faker-js/faker';

interface IntegerGenerationOptions {
  max: Integer;
  /**
   * @default 0
   */
  min?: Integer;
}

interface FloatGenerationOptions {
  max: number;
  /**
   * @default 0
   */
  min?: number;
  /**
   * Maximum amount of decimal points.
   *
   * @default 2
   */
  precision?: number;
}

type Integer = number;

export class ScalarGenerator {
  public static uuid(): string {
    return faker.string.uuid();
  }

  public static pastDate(): Date {
    const date = faker.date.past();

    return date;
  }

  public static integer(options: IntegerGenerationOptions): Integer {
    const { max, min = 0 } = options;

    return faker.number.int({
      max,
      min,
    });
  }

  public static float(options: FloatGenerationOptions): number {
    const { max, min = 0, precision = 2 } = options;

    return faker.number.float({
      max,
      min,
      precision,
    });
  }
}
