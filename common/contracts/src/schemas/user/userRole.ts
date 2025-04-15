export const userRoles = {
  admin: 'admin',
  user: 'user',
} as const;

export type UserRole = (typeof userRoles)[keyof typeof userRoles];
