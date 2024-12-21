export interface BaseErrorContext {
  readonly originalError?: unknown;
  readonly [key: string]: unknown;
}

export class BaseError<Context extends BaseErrorContext = BaseErrorContext> extends Error {
  public readonly context: Context;

  public constructor(name: string, message: string, context: Context) {
    super(message);

    this.name = name;

    this.context = context;
  }
}
