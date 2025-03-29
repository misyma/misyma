export const httpMethodNames = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  delete: 'DELETE',
  patch: 'PATCH',
} as const;

export type HttpMethodName = (typeof httpMethodNames)[keyof typeof httpMethodNames];
