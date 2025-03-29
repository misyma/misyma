export const httpHeaders = {
  authorization: 'Authorization',
  contentType: 'Content-Type',
} as const;

export type HttpHeader = (typeof httpHeaders)[keyof typeof httpHeaders];
