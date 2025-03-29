export const httpMediaTypes = {
  applicationJson: 'application/json',
} as const;

export type HttpMediaType = (typeof httpMediaTypes)[keyof typeof httpMediaTypes];
