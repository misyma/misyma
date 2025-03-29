export const httpStatusCodes = {
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  internalServerError: 500,
} as const;

export type HttpStatusCode = (typeof httpStatusCodes)[keyof typeof httpStatusCodes];
