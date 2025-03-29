export const emailTypes = {
  resetPassword: 'resetPassword',
  verifyEmail: 'verifyEmail',
} as const;

export type EmailType = (typeof emailTypes)[keyof typeof emailTypes];
