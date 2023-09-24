/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ResponseErrorBody {
  readonly error: {
    readonly name: string;
    readonly message: string;
    readonly context?: Record<string, any>;
  };
}
