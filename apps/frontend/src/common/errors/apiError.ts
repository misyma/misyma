interface ApiErrorContext {
  apiResponseError: Record<string, unknown>;
  message: string;
}

export class ApiError extends Error {
  public context: ApiErrorContext;
  public message: string;

  public constructor(message: string, context: ApiErrorContext) {
    super(message);

    this.message = message;

    this.context = context;
  }
}
