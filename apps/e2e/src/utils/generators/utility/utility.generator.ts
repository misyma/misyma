import { faker } from '@faker-js/faker';
import { ScalarGenerator } from '../scalars/scalar.generator';

export class UtilityGenerator {
  public static pastDate(): Date {
    const date = faker.date.past();

    return date;
  }

  public static enumMember(enumObject: Record<string, string>): string {
    const enumValues = Object.values(enumObject);

    const enumValuesAmount = enumValues.length;

    return enumValues[ScalarGenerator.integer({ max: enumValuesAmount - 1 })];
  }
}
