export const securityModes = {
  bearerToken: 'bearerToken',
} as const;

export type SecurityMode = (typeof securityModes)[keyof typeof securityModes];
