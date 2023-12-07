import { faker } from '@faker-js/faker';

interface GeolocationGenerationOptions {
  max?: number;
  min?: number;
  precision?: number;
}

interface CoordinatesGenerationOptions {
  latitudeOptions?: GeolocationGenerationOptions;
  longitudeOptions?: GeolocationGenerationOptions;
}

export class CoordinatesGenerator {
  /**
   * Generates a tuple of two numbers. \
   * These numbers are longitude and latitude in this order.
   *
   * @returns {[number, number]}
   */
  public static coordinates(options: CoordinatesGenerationOptions): [number, number] {
    const { latitudeOptions = {}, longitudeOptions = {} } = options;

    const longitude = this.longitude(longitudeOptions);

    const latitude = this.latitude(latitudeOptions);

    return [longitude, latitude];
  }

  public static longitude(options: GeolocationGenerationOptions): number {
    const { max, min, precision } = options;

    return faker.location.longitude({
      max,
      min,
      precision,
    });
  }

  public static latitude(options: GeolocationGenerationOptions): number {
    const { max, min, precision } = options;

    return faker.location.latitude({
      max,
      min,
      precision,
    });
  }
}
