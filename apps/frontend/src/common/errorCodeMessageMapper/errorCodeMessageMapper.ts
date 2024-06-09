export class ErrorCodeMessageMapper {
  private readonly defaults: Record<number, string> = {
    400: 'Błędne dane.',
    401: 'Brak dostępu.',
    403: 'Niedozwolona akcja',
    500: 'Wewnętrzny błąd serwera',
  };

  private errorMap: Record<number, string>;

  public constructor(errorMap: Record<number, string>) {
    this.errorMap = {
      ...errorMap,
      ...this.defaults,
    };
  }

  public map(code: number): string {
    const message = this.errorMap[code];

    if (!message) {
      return `Nieznany błąd.`;
    }

    return message;
  }
}
