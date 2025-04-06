import { ApiError } from '../errors/apiError';

type CustomErrorMessageProvider = (error: ApiError) => string;

export class ErrorCodeMessageMapper {
  private readonly defaults: Record<number, string | CustomErrorMessageProvider> = {
    400: 'Błędne dane.',
    401: 'Brak dostępu.',
    403: 'Niedozwolona akcja',
    500: 'Wewnętrzny błąd serwera',
  };

  private errorMap: Record<number, string | CustomErrorMessageProvider>;

  public constructor(errorMap: Record<number, string | CustomErrorMessageProvider>) {
    this.errorMap = {
      ...this.defaults,
      ...errorMap,
    };
  }

  public map(error: ApiError, code: number): string {
    const mappedValue = this.errorMap[code];

    if (!mappedValue) {
      return `Nieznany błąd.`;
    }

    if (typeof mappedValue === 'string') {
      return mappedValue;
    }

    return mappedValue(error);
  }
}
